/**
 * Function relating to the info panel.
 */

import $ from "jquery";

export default class Menu {
  constructor({ infoContainer, infoURL }) {
    this.infoContainer = infoContainer;
    this.infoURL = infoURL;
  }

  /**
   * Sets event handlers for toggle buttons.
   */
  static toggleButtonSetup() {
    $(".lh-button-toggle").each(Menu.updateToggleButton);
    $(".lh-button-toggle").on(
      "click",
      { invert: true },
      Menu.updateToggleButton
    );
  }

  /**
   * Event handler for toggle buttons.
   * Updates value to match state of corresponding checkbox.
   * State can be changed by passing an object like {data:{invert:true}}
   * @param {Object} event
   */
  static updateToggleButton(event) {
    const invert = (event && event.data && event.data.invert) == true;

    const id = $(this).attr("id");
    const cb = $(`input[name=${id}]`);
    let state = cb.val() === "true";

    if (invert) state = !state;

    $(this).toggleClass("lh-button-toggle-on", state);
    cb.val(state);
  }

  /**
   * Sets handlers for the info button so that it reflects the display state of
   * the info iframe.
   */
  infoButtonSetup() {
    if (!this.infoContainer) {
      $("#opt_showInfo").hide();
      return;
    }
    $("#opt_showInfo").on("click", () => this.showInfo());
    this.showInfo();
  }

  /**
   * Sets the URL for the info frame.
   * @param {string} url
   */
  setInfoURL(url) {
    this.infoURL = url;
    this.showInfo();
  }

  /**
   * Shows the info panel if it is enabled, otherwise hides it.
   */
  showInfo() {
    if (!this.infoContainer) return;

    $("#lh-info-frame").remove();

    const state = $("input[name=opt_showInfo]").val() === "true";

    if (state) {
      if (this.infoURL) {
        $(
          `<iframe id="lh-info-frame" class="lh-no-save" src="${this.infoURL}"></iframe>`
        ).appendTo(this.infoContainer);
      }
      this.infoContainer.show();
    } else {
      this.infoContainer.hide();
    }
  }

  static setupMenu(menuContainer, latestVersionURL, version) {
    $(`
      <div id="lh-menu" class="lh-no-save">
        <p>You can update an old document to this version by importing it.</p>
        <button id="lh-button-import" title="Update an old document">Import</button>
        <input type="file" id="lh-file-import" accept="text/html" />
        <button id="lh-button-clear" title="Reset the document">Clear</button>
        <button id="lh-button-save" title="Download the document">Save</button>
        <button id="lh-button-export" title="Export document as a printable PDF file">
          Print
        </button>
        <button id="lh-button-widgets" title="Add tools to the sidebar">Addons</button>
        <button
          id="opt_showInfo"
          class="lh-button-toggle"
          title="Toggle display of the sidebar"
        >
          Show Sidebar
        </button>
        <form><input type="hidden" name="opt_showInfo" value="false" /></form>
      </div>
      `).prependTo(menuContainer);
    if (latestVersionURL) {
      $(`<p>
        The latest version can be found
        <a
          href="${latestVersionURL}"
          target="_blank"
          >here</a
        >.
      </p>`).prependTo("#lh-menu");
    }
    if (version) {
      $(`<p>Document Source Version ${version}</p>`).prependTo("#lh-menu");
    }
  }
}
