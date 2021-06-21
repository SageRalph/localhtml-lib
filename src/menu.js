/**
 * Function relating to the info panel.
 */

import $ from "jquery";

export default class Menu {
  constructor({}) {}

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
