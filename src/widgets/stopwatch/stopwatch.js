import $ from "jquery";
import HtmlDurationPicker from "html-duration-picker";
import Dialog from "../../dialog";
import Widget from "../widget";
import "./stopwatch.css";

export default class WidgetStopwatch extends Widget {
  constructor(args) {
    args.type = "stopwatch";
    super(args);
  }

  _draw() {
    const me = this;

    if (!this.contentData.elapsed) {
      this.contentData.elapsed = 0;
    }

    // Draw Template
    $(this.container).html(`
      <form class="lh-stopwatch-form">
        <h3 class="lh-stopwatch-elapsed"></h3>
        <button class="lh-button-alarm" title="Set Alarm"></button>
        <input type="reset" class="lh-button-reset" value="" title="Reset"/>
        <input type="submit" class="lh-button-start" value="" title="Start/Pause"/>
      </form>
    `);

    // Draw content
    this._updateDisplay();

    // Setup actions
    $(this.container)
      .find(".lh-stopwatch-form")
      .on("submit", function (e) {
        e.preventDefault();
        me._startStop();
      });

    $(this.container)
      .find(".lh-stopwatch-form")
      .on("reset", function (e) {
        e.preventDefault();
        me._reset();
      });

    $(this.container)
      .find(".lh-button-alarm")
      .on("click", function (e) {
        e.preventDefault();
        me._showAlarmMenu();
      });
  }

  _showAlarmMenu() {
    const me = this;

    // Create dialog
    const d = WidgetStopwatch.timeSecondsToStr(me.contentData.alarm || 0);
    const diag = Dialog.show(`
      <h2>Set Alarm</h2>
      <input class="html-duration-picker" data-duration="${d}">
      <button name="alarm-set" title="Alarm on/off"></button>
    `);
    HtmlDurationPicker.refresh();

    // Set button state
    diag
      .find("[name=alarm-set]")
      .addClass(
        me.contentData.alarmSet ? "lh-button-alarm" : "lh-button-alarm-off"
      )
      .on("click", function (e) {
        e.preventDefault();
        diag
          .find("[name=alarm-set]")
          .toggleClass("lh-button-alarm lh-button-alarm-off");
        me.contentData.alarmSet = !me.contentData.alarmSet;
      });

    // Synchronize alarm time when closing dialog
    diag.on("reset", function (e) {
      const str = diag.find(".html-duration-picker").val();
      me.contentData.alarm = WidgetStopwatch.timeStrToSeconds(str);
      me._updateDisplay();
    });
  }

  _updateDisplay() {
    let str = WidgetStopwatch.timeSecondsToStr(this.contentData.elapsed);
    if (this.contentData.alarmSet) {
      str += ` / ${WidgetStopwatch.timeSecondsToStr(this.contentData.alarm)}`;
    }
    $(this.container).find(".lh-stopwatch-elapsed").text(str);
  }

  /**
   * Converts an int number of seconds to a time string in the form hh:mm:ss.
   * @param {int} seconds
   * @returns {string}
   */
  static timeSecondsToStr(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    function padTime(t) {
      if (!t) return "00";
      if (t < 10) return "0" + t;
      return t;
    }

    return padTime(hours) + ":" + padTime(mins) + ":" + padTime(secs);
  }

  /**
   * Converts a time string in the form hh:mm:ss to an int number of seconds.
   * @param {String} str
   * @returns {int}
   */
  static timeStrToSeconds(str) {
    const parts = str.split(":");
    let seconds = parseInt(parts.pop());
    seconds += parseInt(parts.pop()) * 60;
    seconds += parseInt(parts.pop()) * 3600;
    return seconds;
  }

  _preDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  _startStop() {
    // Pause
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;

      $(this.container)
        .find(".lh-button-pause")
        .toggleClass("lh-button-start lh-button-pause");
    }
    // Start
    else {
      this.interval = setInterval(this._tick.bind(this), 1000);

      $(this.container)
        .find(".lh-button-start")
        .toggleClass("lh-button-start lh-button-pause");
    }
  }

  static _beep() {
    new Audio(
      "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
    ).play();
  }

  _tick() {
    this.contentData.elapsed += 1;
    this._updateDisplay();

    // Alarm
    if (
      this.contentData.alarmSet &&
      this.contentData.elapsed === this.contentData.alarm
    ) {
      $(this.superContainer).addClass("lh-animation-pulse-yellow");
      for (let i = 0; i < 5; i++) {
        setTimeout(WidgetStopwatch._beep, i * 500);
      }
    }
  }

  _reset() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.contentData.elapsed = 0;
    this._updateDisplay();

    $(this.container)
      .find(".lh-button-pause")
      .toggleClass("lh-button-start lh-button-pause");

    $(this.superContainer).removeClass("lh-animation-pulse-yellow");
  }
}
