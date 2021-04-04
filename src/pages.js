/**
 * Functions for managing Quill pages and Quill fields.
 * Extra pages are full page sized Quill editors.
 */

import $ from "jquery";
import Quill from "quill";
import Meta from "./meta";

export default class Pages {
  constructor({ log }) {
    this.log = log;

    this.quills = [];
    this.extraPages = [];
  }

  initQuills() {
    $(".lh-quill-field").each((i, element) => this._setupQuill(element));
  }

  /**
   * Creates a new Quill page with a random name.
   * The Quill pages are then redrawn.
   */
  addPage() {
    const name = `longinfo_Extra_${Meta.randomString(8)}`;
    this.extraPages.push(name);
    this._buildExtraPages();
  }

  /**
   * Removes Quill page at index.
   * The Quill pages are then redrawn.
   * @param {*} index
   */
  removePage(index) {
    if (!confirm("Are you sure you want to remove this page?")) return;
    this.extraPages.splice(index, 1);
    this._buildExtraPages();
  }

  /**
   * Reorders the list of Quill pages, moving page at index from to index to.
   * The Quill pages are then redrawn.
   * @param {Int} from
   * @param {Int} to
   */
  movePage(from, to) {
    // remove `from` item and store it
    const f = this.extraPages.splice(from, 1)[0];
    // insert stored item into position `to`
    this.extraPages.splice(to, 0, f);
    this._buildExtraPages();
  }

  /**
   * Deletes the content of all Quill fields.
   */
  clearQuills() {
    for (let i = 0; i < this.quills.length; i++) {
      this.quills[i].editor.setContents();
    }
  }

  /**
   * Returns an object with the content of all Quill fields as properties.
   * The returned object will also have an array property "this.extraPages" with the names of each Quill page.
   */
  getQuillPages() {
    const data = {};
    for (let i = 0; i < this.quills.length; i++) {
      const q = this.quills[i];
      data[q.name] = q.editor.getContents();
    }
    data["this.extraPages"] = this.extraPages;
    return data;
  }

  /**
   * Rebuilds Quill pages to match the array data[this.extraPages] and populates them
   * from data[name] where name is a value in data[this.extraPages]. If either data or
   * data[this.extraPages] are empty or not set, all current Quill pages are destroyed.
   * @returns {Object}
   */
  setQuillPages(data) {
    this.extraPages = data && "extraPages" in data ? data["extraPages"] : [];
    this._buildExtraPages(data);
  }

  /**
   * Destroys any Quill instances on the page and then removes the page.
   * @param {*} element The page element
   */
  _destroyPage(element) {
    // All this.quills on this page need to be destroyed first
    const childQuillNames = $(element)
      .find(".lh-quill-field")
      .map((i, e) => $(e).attr("name"))
      .get();

    // console.log("EXTRANEOUS QUILLS: ", childQuillNames);

    // Loop through all existing this.quills and destroy any on this page
    const keepQuills = [];
    for (let i = 0; i < this.quills.length; i++) {
      const q = this.quills[i];
      if (childQuillNames.includes(q.name)) {
        // console.log("DESTROYING QUILL: " + q.name);
        q.editor.enable(false);
        q.editor = null;
      } else {
        // console.log("KEEPING QUILL: " + q.name);
        keepQuills.push(q);
      }
    }
    this.quills = keepQuills;

    $(element).remove();
  }

  /**
   * Overrides the content of Quill editors to match values in data.
   * Quills not present in data are not modified.
   * @param {Object} data
   */
  _loadQuills(data) {
    // Add quill data
    for (let i = 0; i < this.quills.length; i++) {
      const q = this.quills[i];
      if (q.name in data) {
        const d = data[q.name];
        if (typeof d === "string") {
          // Backwards compatibility for importing previously non-quill fields
          this.log("MIGRATING " + q.name);
          q.editor.setText(d);
        } else {
          q.editor.setContents(d);
        }
      }
    }
  }

  /**
   * Creates a Quill editor inside element.
   * If element has the class "lh-quill-advanced", the editor will have a toolbar.
   * @param {*} element
   */
  _setupQuill(element) {
    // Settings for Quills with a context menu
    const optionsSimple = {
      modules: {
        toolbar: [
          [
            "bold",
            "italic",
            "underline",
            { color: [] },
            "link",
            "blockquote",
            { list: "ordered" },
            { list: "bullet" },
          ],
        ],
      },
      theme: "bubble",
    };
    // Settings for Quills with a toolbar (must have the lh-quill-advanced CSS class)
    const optionsAdvanced = {
      modules: {
        toolbar: [
          [
            { header: [1, 2, false] },
            { indent: "-1" },
            { indent: "+1" },
            "bold",
            "italic",
            "underline",
            { color: [] },
            "link",
            "blockquote",
            { list: "ordered" },
            { list: "bullet" },
            "image",
          ],
        ],
      },
      theme: "snow",
    };
    const isAdvanced = $(element).hasClass("lh-quill-advanced");
    const options = isAdvanced ? optionsAdvanced : optionsSimple;
    const child = $("<div></div>").get(0);
    $(element).append(child);
    const editor = new Quill(child, options);
    editor.on("text-change", (e) => $(element).trigger("change"));
    this.quills.push({
      name: $(element).attr("name"),
      editor,
    });
  }

  /**
   * Draws an Quill page and sets up its Quill.
   * @param {*} name
   * @param {*} index
   */
  _setupExtraPage(name, index) {
    // Create page HTML
    const preSize = $(".lh-page").length; // Number of static pages
    const parent = $(`
      <div class="lh-page-wrapper lh-extra-page lh-no-save">
        <div class="lh-page-toolbar">
          <h2>Page ${index + preSize + 1} of ${
      this.extraPages.length + preSize
    }</h2>
          <div class="lh-button-wrapper">
            <button class="lh-button-delete" title="Remove this page">⮿</button>
            <button class="lh-button-up" title="Swap this page with the one above">⯅</button>
            <button class="lh-button-down" title="Swap this page with the one below">⯆</button>
          </div>
        </div>
        <div class="lh-page-area">
          <article
            name="${name}"
            class="lh-quill-field lh-quill-advanced lh-quill-page"
          ></article>
        </div>
      </div>
      `);
    parent.insertBefore("#lh-footer");

    // Setup buttons
    parent
      .find(".lh-button-delete")
      .on("click", this.removePage.bind(this, index));
    parent
      .find(".lh-button-up")
      .on("click", this.movePage.bind(this, index, index - 1));
    parent
      .find(".lh-button-down")
      .on("click", this.movePage.bind(this, index, index + 1));
    if (index == 0) parent.find(".lh-button-up").prop("disabled", true);
    if (index == this.extraPages.length - 1)
      parent.find(".lh-button-down").prop("disabled", true);

    // Setup Quill
    const child = parent.find(`[name="${name}"]`).first();
    this._setupQuill(child);
  }

  /**
   * Draws all Quill pages to match this.extraPages, using content from data.
   * @param {Object} data
   */
  _buildExtraPages(data) {
    if (!data) {
      // Keep existing quill data if not overriding
      data = {};
      for (let i = 0; i < this.quills.length; i++) {
        const q = this.quills[i];
        data[q.name] = q.editor.getContents();
      }
    }

    // Destroy existing Quill pages
    $(".lh-extra-page").each((i, element) => this._destroyPage(element));

    // Add any Quill pages
    this.extraPages.forEach((name, index) => this._setupExtraPage(name, index));

    this._loadQuills(data);
  }
}
