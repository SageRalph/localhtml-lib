/**
 * Function relating to the widgets sidebar.
 * All widgets should be registered here.
 */

import Dice from "./widgets/dice/dice";

export default class Sidebar {
  constructor({ sidebarContainer }) {
    this.sidebarContainer = sidebarContainer;

    this.widgets = [];
    this.knownWidgets = {
      dice: { name: "Dice Box", registration: Dice },
    };
  }

  /**
   * Displays the sidebar manager
   */
  openManager() {
    const me = this;

    const currentWidgets = this.widgets
      .map(
        (w) =>
          `<li>${
            me.knownWidgets[w.type].name
          } <button class="lh-button-remove-widget lh-button-close"></button></li>`
      )
      .join("");

    const possibleWidgets = Object.keys(this.knownWidgets)
      .map((k) => `<option value="${k}">${me.knownWidgets[k].name}</option>`)
      .join("");

    this.closeManager();
    $("body").append(`
      <div class="lh-dialog-wrapper lh-no-save">
        <form id="lh-widget-manager" class="lh-dialog">
          <h2>Current Addons</h2>
          <ol id="lh-widget-list">
            ${currentWidgets || "None"}
          </ol>
          <h2>New Addon</h2>
          <select name="type">
            ${possibleWidgets}
          </select>
          <input type="submit" value="Add" id="lh-button-add-widget"/>
          <input type="reset" value="" class="lh-button-close"/>
        </form>
      </div>
    `);

    $("#lh-widget-manager .lh-button-remove-widget").on("click", function (e) {
      e.preventDefault();
      const index = $(this).parent().index();
      me.removeWidget(index);
      me.openManager();
    });

    $("#lh-widget-manager").on("reset", (e) => {
      me.closeManager();
    });

    $("#lh-widget-manager").on("submit", (e) => {
      e.preventDefault();
      const type = $("#lh-widget-manager [name=type]").val();
      me.addWidget({ type });
      me.openManager();
    });
  }

  closeManager() {
    $(".lh-dialog-wrapper").remove();
  }

  /**
   * Creates a new Widget with a random name.
   */
  addWidget({ type, id, contentData }) {
    if (!type in this.knownWidgets) {
      throw new Error("Unsupported Widget type: " + type);
    }

    const created = new this.knownWidgets[type].registration({
      parent: this.sidebarContainer,
      contentData,
      id,
    });

    this.widgets.push(created);
  }

  /**
   * Removes Widget page at index.
   * @param {Int} index
   */
  removeWidget(index) {
    if (!confirm("Are you sure you want to remove this widget?")) return;
    const removed = this.widgets.splice(index, 1)[0];
    removed.destroy();
  }

  /**
   * Removes all widgets.
   */
  removeAllWidgets() {
    for (const w of this.widgets) {
      w.destroy();
    }
    this.widgets = [];
  }

  /**
   * Resets the state of all widgets.
   */
  clearWidgetData() {
    for (const w of this.widgets) {
      w.loadData();
    }
  }

  /**
   * Returns a list of objects with the content of all widgets.
   * @returns {Array}
   */
  getWidgets() {
    return this.widgets.map(function (w) {
      return w.getData();
    });
  }

  /**
   * Rebuilds widgets to match the data array.
   * If data is empty or not an array, all current widgets are destroyed.
   * @param {Array} data
   */
  setWidgets(data) {
    if (!this.sidebarContainer) {
      $("#lh-button-widgets").hide();
      return console.log("sidebarContainer not set: Widgets disabled");
    }

    // Destroy existing
    this.removeAllWidgets();

    if (!Array.isArray(data)) {
      console.log("No existing widgets to register");
      return;
    }

    // Register new
    for (const w of data) {
      this.addWidget(w);
    }
  }
}
