import $ from "jquery";
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
      <details class="lh-stopwatch" open>
        <summary>Stopwatch</summary>
        <form class="lh-stopwatch-form">
          <h3 class="lh-stopwatch-elapsed"></h3>
          <!-- <button class="lh-button-alarm"></button> -->
          <input type="reset" class="lh-button-reset" value=""/>
          <input type="submit" class="lh-button-start" value=""/>
        </form>
      </details>  
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

    // $(this.container)
    //   .find(".lh-button-alarm")
    //   .on("click", function (e) {
    //     e.preventDefault();
    //     // TODO
    //   });
  }

  _updateDisplay() {
    const str = WidgetStopwatch.timeString(this.contentData.elapsed);
    $(this.container).find(".lh-stopwatch-elapsed").text(str);
  }

  static timeString(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    function padTime(t) {
      if (!t) return "00";
      if (t < 10) return "0" + t;
      return t;
    }

    return padTime(mins) + ":" + padTime(secs);
  }

  destroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    $(this.container).remove();
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

  _tick() {
    this.contentData.elapsed += 1;
    this._updateDisplay();
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
  }
}
