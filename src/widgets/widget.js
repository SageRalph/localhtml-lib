import Meta from "../meta";

/**
 * Parent class for lh-widgets.
 * Subclasses should override the _draw() method
 * and store all persistent state in the this.contentData object
 * Widgets should be registered in sidebar.js
 */
export default class Widget {
  constructor({ id, type, parent, contentData }) {
    this.id = id || `widget_${Meta.randomString(8)}`;

    if (!type) throw new Error("Widget must have a type");
    this.type = type;

    if (!parent) throw new Error("Widget must have a parent");
    this.container = $(`<div id=${this.id} class="lh-no-save"></div>`);
    $(parent).append(this.container);

    this.contentData = {};
    this.loadData(contentData);

    console.log("Registered widget with id " + this.id);
  }

  /**
   * Optional override.
   * Removes the widget.
   */
  destroy() {
    $(this.container).empty();
  }

  /**
   * Optional override.
   * Sets or resets the state of the widget and triggers this._draw()
   * @param {Object} contentData
   */
  loadData(contentData) {
    this.contentData = contentData || {};
    this._draw();
  }

  /**
   * Do not override unless matching the same signature.
   * Returns data needed to reconstruct the widget.
   * @returns {Object} Object with properties id, type, and contentData
   */
  getData() {
    return {
      id: this.id,
      type: this.type,
      contentData: this._getContentData(),
    };
  }

  /**
   * Optional override.
   * Returns the JSON serializable state data for the widget.
   * @returns {Object}
   */
  _getContentData() {
    return this.contentData;
  }

  /**
   * Mandatory override.
   * Should draw the widget inside this.container
   */
  _draw() {
    console.warning("Widget has not implemented _draw");
  }
}
