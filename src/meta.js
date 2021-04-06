/**
 * Functions for getting sheet metadata, and miscellaneous general functions.
 */

import $ from "jquery";

export default class Meta {
  constructor({
    customSheetName,
    latestVersionURL,
    defaultSheetName = "document",
    log,
  }) {
    this.customSheetName = customSheetName;
    this.latestVersionURL = latestVersionURL;
    this.defaultSheetName = defaultSheetName;
    this.log = log;
  }

  /**
   * Returns a suggested filename for the sheet.
   * @returns {String}
   * @param {Object} data
   */
  sheetName(data) {
    let basename = this.defaultSheetName;
    if (this.customSheetName) basename = this.customSheetName(data) || basename;
    return basename + ".html";
  }

  /**
   * Returns whether the data object is from a version prior to target.
   * Must use semantic versioning.
   * @param {Object} data
   * @param {String} target
   */
  static versionBefore(data, target) {
    const old = "sheetVersion" in data ? data["sheetVersion"] : "0.0.0";
    return Meta.versionCompare(old, target) < 0;
  }

  /**
   * Compares semantic versions.
   * Returns 1 if v1 is greater, -1 if v2 is greater, 0 if match.
   * @param {String} v1
   * @param {String} v2
   */
  static versionCompare(v1, v2) {
    const v1parts = v1.split(".").map(Number);
    const v2parts = v2.split(".").map(Number);
    for (let i = 0; i < v1parts.length; ++i) {
      if (v2parts.length == i) return 1;
      if (v1parts[i] == v2parts[i]) continue;
      else if (v1parts[i] > v2parts[i]) return 1;
      else return -1;
    }
    if (v1parts.length != v2parts.length) return -1;
    return 0;
  }

  /**
   * Returns a random string of length N.
   * @returns {String}
   * @param {Int} N
   */
  static randomString(N) {
    return (Math.random().toString(36) + "00000000000000000").slice(2, N + 2);
  }

  updateCheck() {
    if (location.hostname !== "") return; // Only local copies need to update
    if (!this.latestVersionURL) return;

    const me = this;
    me.log("CHECKING FOR UPDATES");
    const url = this.latestVersionURL + "?update";
    $.get(url, function (data) {
      const match = data.match(/Build version: (.+?) -/);
      if (!match) {
        me.log("LATEST VERSION NOT FOUND");
        return;
      }
      const latest = match[1];
      const current = $("#sheetVersion").text();
      me.log("CURRENT VERSION: " + current);
      me.log("LATEST VERSION: " + latest);
      if (Meta.versionBefore({ sheetVersion: current }, latest)) {
        me.log("NEWER VERSION AVAILABLE");
        if (
          confirm(
            "A new document version is available. You can import this document to the new version. Would you like to update now?"
          )
        ) {
          window.open(url, "_blank").focus();
        }
      } else {
        me.log("UP TO DATE");
      }
    });
  }

  /**
   * Hides and then fades in whatever element is bound to this.
   * e.g. $().click(blink)
   */
  static blink() {
    $(this).css({ opacity: 0 }).animate({ opacity: 1 }, 1000);
  }
}
