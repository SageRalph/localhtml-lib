/**
 * Function relating to the widgets sidebar.
 * All widgets should be registered here.
 */

import Dialog from "./dialog";
import WidgetNotepad from "./widgets/notepad/notepad";
import WidgetDice from "./widgets/dice/dice";
import WidgetStopwatch from "./widgets/stopwatch/stopwatch";
import WidgetBrowser from "./widgets/browser/browser";

export default class Sidebar {
  constructor({ sidebarContainer, infoURL = "", disabledWidgets = [], log }) {
    this.sidebarContainer = sidebarContainer;
    this.log = log;

    this.widgets = [];
    this.knownWidgets = {
      notepad: { name: "Notepad", registration: WidgetNotepad },
      dice: { name: "Dice Box", registration: WidgetDice },
      stopwatch: { name: "Stopwatch", registration: WidgetStopwatch },
      browser: { name: "Browser", registration: WidgetBrowser },
    };
    this.disabledWidgets = disabledWidgets;
    this.setInfoURL(infoURL);
  }

  /**
   * Displays the sidebar manager
   */
  openManager() {
    const me = this;

    const currentWidgets = this.widgets
      .filter((w) => !me.disabledWidgets.includes(w.type))
      .map(
        (w) =>
          `<li>
            ${me.knownWidgets[w.type].name} 
            <button class="lh-button-remove-widget lh-button-close"></button>
          </li>`
      )
      .join("");

    const possibleWidgets = Object.keys(this.knownWidgets)
      .filter((k) => !me.disabledWidgets.includes(k))
      .map((k) => `<option value="${k}">${me.knownWidgets[k].name}</option>`)
      .join("");

    const manager = Dialog.show(`
      <h2>Current Addons</h2>
      <ol id="lh-widget-list">
        ${currentWidgets || "None"}
      </ol>
      <h2>New Addon</h2>
      <select name="type">
        ${possibleWidgets}
      </select>
      <input type="submit" value="Add" id="lh-button-add-widget"/>
    `);

    manager.find(".lh-button-remove-widget").on("click", function (e) {
      e.preventDefault();
      const index = $(this).parent().index();
      me.removeWidget(index);
      me.openManager();
    });

    manager.on("submit", (e) => {
      e.preventDefault();
      const type = manager.find("[name=type]").val();
      const data = { type };
      if (type === "browser" && this.infoURL) {
        data.contentData = { defaultURL: this.infoURL };
      }
      me.addWidget(data);
      me.openManager();
    });
  }

  /**
   * Creates a new Widget with a random name.
   */
  addWidget({ type, id, contentData }) {
    if (!type in this.knownWidgets) {
      throw new Error(`Unsupported Widget type: "${type}"`);
    }

    if (this.disabledWidgets.includes(type)) {
      return this.log(`Widget not added: Widget type "${type}" is disabled`);
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
      const defaultData = {};
      if (w.type === "browser" && this.infoURL) {
        defaultData.defaultURL = this.infoURL;
      }
      w.loadData(defaultData);
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
      return this.log("sidebarContainer not set: Widgets disabled");
    }

    // Destroy existing
    this.removeAllWidgets();

    if (!Array.isArray(data)) {
      this.log("No existing widgets to register");
      return;
    }

    // Register new
    for (const w of data) {
      this.addWidget(w);
    }
  }

  /**
   * Sets the default URL for new browser widgets.
   * If infoURl is not a string, browser widgets will be disabled.
   * @param {String} infoURL
   */
  setInfoURL(infoURL) {
    this.infoURL = infoURL;
    if (typeof this.infoURL !== "string") {
      this.disableWidget("browser");
    }
  }

  /**
   * Prevents a widget from being added or drawn.
   * @param {String} key
   */
  disableWidget(key) {
    if (this.disabledWidgets.includes(key)) return;
    this.disabledWidgets.push(key);
    this.reloadWidgets();
  }

  /**
   * Re-enables a widget that has been disabled.
   * @param {String} key
   */
  enableWidget(key) {
    this.disabledWidgets = this.disabledWidgets.filter((k) => k != key);
  }

  /**
   * Forces a redraw of all widgets.
   */
  reloadWidgets() {
    const data = this.getWidgets();
    this.setWidgets(data);
  }
}
