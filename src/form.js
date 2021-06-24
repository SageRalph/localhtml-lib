/**
 * Functions for manipulating the form, including importing, exporting, and saving.
 */

import $ from "jquery";
import "jquery-deserialize";
import "jquery-serializejson";
import { saveAs } from "file-saver";
import Menu from "./menu";

export default class Form {
  constructor({ menu, sidebar, pages, meta, formSelector, migrations, log }) {
    this.menu = menu;
    this.sidebar = sidebar;
    this.pages = pages;
    this.meta = meta;
    this.formSelector = formSelector;
    this.migrations = migrations;
    this.log = log;
  }

  /**
   * Resets the form and removes all Quill pages.
   */
  clearData() {
    if (!confirm("Are you sure you want to clear the document?")) return;
    this.loadFromObject({});
  }

  /**
   * Loads the serialized sheet data from the "#sheetData" element.
   */
  loadFromFile() {
    this.log("LOADING");

    const dataStr = $("#sheetData").text();
    if (dataStr) {
      this.log("LOADING FROM HTML");
      const data = JSON.parse(dataStr);
      // Update form
      this.loadFromObject(data);
    } else {
      this.log("NOTHING TO LOAD");
    }
  }

  /**
   * Clears the form and fills it with data, then draws the Quill pages.
   * @param {Object} data
   */
  loadFromObject(data) {
    // Update form
    $(this.formSelector).trigger("reset");
    $(this.formSelector).each(function () {
      $(this).deserialize(data);
    });
    // Update Quills
    this.pages.clearQuills();
    this.pages.setQuillPages(data);
    // Update Widgets
    this.sidebar.setWidgets(data["widgets"]);
    // Reset menus
    $(".lh-button-toggle").each(Menu.updateToggleButton);
  }

  /**
   * Saves the entire site to file.
   */
  async saveHTML() {
    this.log("SAVING");

    const data = this.getData();

    const dataStr = JSON.stringify(data);
    $("#sheetData").text(dataStr);

    const blob = new Blob([await this._getPageHTML()], {
      type: "text/html;charset=utf-8",
    });
    const fname = this.meta.sheetName(data);
    saveAs(blob, fname);

    this.log("SAVED " + fname);
    // this.log(data);
  }

  /**
   * Returns a data object with everything necessary for filling the form.
   * @returns {Object}
   */
  getData() {
    let data = {};
    $(this.formSelector).each(function () {
      if ($(this).closest(".lh-no-save").length) return;
      Object.assign(data, $(this).serializeJSON());
    });

    // Add Quill pages
    Object.assign(data, this.pages.getQuillPages());

    // Add widgets
    data["widgets"] = this.sidebar.getWidgets();

    // Add sheet version (immutable)
    data["sheetVersion"] = $("#sheetVersion").text();

    return data;
  }

  /**
   * Prints the page.
   */
  static savePDF() {
    window.print();
  }

  /**
   * Opens a file selection dialog for the user to select a sheet to import.
   * Then overrides the sheets data with the loaded data, migrating if needed.
   */
  loadFromImport() {
    const me = this;

    if (!confirm("Any unsaved changes will be lost. Proceed?")) return;

    me.log("LOADING FROM IMPORT");

    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;

      // Extract and parse sheet data
      const exp = /<div id="sheetData"(.*?)>(.*?)<\/div>/im;
      const dataStr = exp.exec(text)[2];
      let data = JSON.parse(dataStr);

      if (me.migrations) {
        data = me.migrations(data);
      }

      // Update form
      me.loadFromObject(data);
    };

    // Read in the file as a data URL
    const f = $("#lh-file-import").prop("files")[0];
    reader.readAsText(f);
  }

  /**
   * Returns the serializable HTML from the site, excluding dynamic content.
   * @returns {String}
   */
  async _getPageHTML() {
    // Copy the document
    var doc = $("html").clone();

    // Clean up dynamic content
    doc.find(".lh-no-save, .lh-quill-field *").remove();

    // Inline localhtml-lib if it is loaded from a script src
    const script = doc.find("script[src*='localhtml.min.js']");
    if (script.length) {
      const url = script.attr("src");
      const content = await $.ajax({ url, dataType: "text" });
      script.removeAttr("src");
      script.text(content);
    }

    return `<!DOCTYPE html><html>${doc.html()}</html>`;
  }
}
