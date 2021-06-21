/**
 * Program entrypoint.
 * Runs initialisation, loads the assets, and sets event listeners.
 */

import $ from "jquery";

import "./styles.css";
import "../node_modules/quill/dist/quill.bubble.css";
import "../node_modules/quill/dist/quill.snow.css";

import Pages from "./pages";
import Meta from "./meta";
import Menu from "./menu";
import Form from "./form";
import Sidebar from "./sidebar";

export default class localhtml {
  constructor({
    version,
    documentContainer = "body",
    menuContainer,
    infoContainer,
    formSelector = "form",
    migrations,
    dataChangedAction,
    dataChangedCooldown,
    infoURL,
    customSheetName,
    latestVersionURL,
    defaultSheetName,
    hotkeysEnabled,
    log,
  }) {
    documentContainer = $(documentContainer);
    if (documentContainer.length !== 1)
      throw "documentContainer must be or match a single element";
    this.documentContainer = documentContainer;
    documentContainer.addClass("lh-document-container");

    if (typeof log !== "function") log = () => {};
    this.log = log;

    this.formSelector = formSelector;
    this.dataChangedAction = dataChangedAction;
    this.dataChangedCooldown = dataChangedCooldown;
    this.dataChangedCooldownWaiting = false;
    this.dataChangedPending = false;
    this.hotkeysEnabled = hotkeysEnabled;

    // Set sheet to current version
    if (version && !$("#sheetVersion").length) {
      $(
        `<div id="sheetVersion" style="display: none" hidden="">${version}</div>`
      ).prependTo(documentContainer);
    }

    // Create data container if not exists
    if (!$("#sheetData").length) {
      $(`<div id="sheetData" style="display: none" hidden=""></div>`).prependTo(
        documentContainer
      );
    }

    // Create quill event watcher
    $(
      `<div id="lh-event-watcher" class="lh-no-save" style="display: none" hidden=""></div>`
    ).prependTo(documentContainer);

    // Create add page button
    $(`
      <div id="lh-footer" class="lh-page-toolbar lh-no-save">
        <div class="lh-button-wrapper">
          <button id="lh-button-add" title="Add an extra page">+</button>
        </div>
      </div>
    `).appendTo(documentContainer);

    // Create menu
    if (menuContainer) {
      menuContainer = $(menuContainer);
      if (menuContainer.length !== 1)
        throw "menuContainer must be or match a single element";
      this.menuContainer = menuContainer;
      menuContainer.addClass("lh-menu-container");
      Menu.setupMenu(menuContainer, latestVersionURL, version);
    }

    if (infoContainer) {
      infoContainer = $(infoContainer);
      if (infoContainer.length !== 1)
        throw "infoContainer must be or match a single element";
      this.infoContainer = infoContainer;
      infoContainer.addClass("lh-sidebar-container");

      this.sidebarContainer = $(
        `<div class="lh-widget-container lh-no-save"></div>`
      );
      $(this.infoContainer).append(this.sidebarContainer);
    }

    this.menu = new Menu({});
    this.sidebar = new Sidebar({
      sidebarContainer: this.sidebarContainer,
      infoURL,
      log,
    });
    this.pages = new Pages({ log });
    this.meta = new Meta({
      customSheetName,
      latestVersionURL,
      defaultSheetName,
      log,
    });
    this.form = new Form({
      menu: this.menu,
      sidebar: this.sidebar,
      pages: this.pages,
      meta: this.meta,
      formSelector,
      migrations,
      log,
    });

    // Expose useful functions from other modules
    this.api = {
      setDataChangedAction: this.setDataChangedAction.bind(this),
      getData: this.form.getData.bind(this.form),
      loadData: this.form.loadFromObject.bind(this.form),
      clearData: this.form.clearData.bind(this.form),
      getSheetName: this.meta.sheetName.bind(this.meta),
      setInfoURL: this.sidebar.setInfoURL.bind(this.sidebar),
      addWidget: this.sidebar.addWidget.bind(this.sidebar),
      removeWidget: this.sidebar.removeWidget.bind(this.sidebar),
      clearWidgetData: this.sidebar.clearWidgetData.bind(this.sidebar),
      versionBefore: Meta.versionBefore,
    };

    this._setup();

    window.localhtml = this;
  }

  /**
   * Initial page setup
   */
  _setup() {
    this.log("SETUP QUILLS");
    this.pages.initQuills();

    this.log("SETUP FORM");
    this.form.loadFromFile();
    $(`${this.formSelector}, #lh-event-watcher`).on("change", (e) =>
      this._dataChanged(e)
    );

    this.log("SETUP TOGGLE BUTTONS");
    Menu.toggleButtonSetup();

    this.log("SETUP BUTTONS");
    if (this.menuContainer)
      this.menuContainer.find("button").on("click", (e) => e.preventDefault());
    $("#lh-button-save").on("click", (e) => this.form.saveHTML());
    $("#lh-button-clear").on("click", (e) => this.form.clearData());
    $("#lh-button-export").on("click", Form.savePDF);
    $("#lh-button-widgets").on("click", (e) => this.sidebar.openManager());
    $("#lh-button-add").on("click", (e) => this.pages.addPage());

    // Click file import when Import button is clicked
    $("#lh-button-import").on("click", (e) => {
      $("#lh-file-import").trigger("click");
    });
    $("#lh-file-import").on("change", (e) => this.form.loadFromImport());

    // All buttons blink when clicked
    $("button").on("click", Meta.blink);

    if (window.location.href.endsWith("?update")) {
      alert(
        "This is the latest document version. To update an existing document click the Import button."
      );
    } else {
      this.meta.updateCheck();
    }

    if (this.hotkeysEnabled) this._setupHotkeys();
  }

  _setupHotkeys() {
    const me = this;
    $(window).on("keydown", function (event) {
      // Override CTRL+S to save the site data properly
      if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
          case "s":
            event.preventDefault();
            me.form.saveHTML(event);
        }
      }
    });
  }

  /**
   * Called whenever the contents of the sheet is changed.
   */
  _dataChanged() {
    const me = this;
    if (!this.dataChangedAction) return;

    // Limit the number of calls to dataChangedAction
    // First call is run immediately
    // If calls are made during cooldown, it runs once more after cooldown
    if (this.dataChangedCooldownWaiting) {
      this.dataChangedPending = true;
    } else {
      // Block future calls
      this.dataChangedCooldownWaiting = true;
      // Clear pending
      this.dataChangedPending = false;
      // Run the action
      this.dataChangedAction();
      // After cooldown,
      setTimeout(function () {
        // Permit calls
        me.dataChangedCooldownWaiting = false;
        // If any were blocked, try again
        if (me.dataChangedPending) me._dataChanged();
      }, this.dataChangedCooldown);
    }
  }

  /**
   * Sets the function and cooldown for handling data changes
   * @param {function} action the function to call
   * @param {int} cooldown delay between calls in milliseconds
   */
  setDataChangedAction(action, cooldown) {
    if (action) this.dataChangedAction = action;
    if (cooldown) this.dataChangedCooldown = cooldown;
    this.dataChangedCooldownWaiting = false;
    this.dataChangedCooldownPending = false;
  }
}
// Expose class
window.localhtml = localhtml;
// Expose jquery
window.$ = $;
