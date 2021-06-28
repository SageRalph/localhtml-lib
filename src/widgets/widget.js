import Meta from "../meta";

/**
 * Parent class for lh-widgets.
 * Subclasses should override the _draw() method
 * and store all persistent state in the this.contentData object
 * Widgets should be registered in sidebar.js
 */
export default class Widget {
  constructor({ id, type, parent, contentData, displayName }) {
    const me = this;

    this.id = id || `widget_${Meta.randomString(8)}`;

    if (!type) throw new Error("Widget must have a type");
    this.type = type;

    this.displayName = displayName || this.type;

    if (!parent) throw new Error("Widget must have a parent");

    this.superContainer = $(`
      <div id=${this.id} class="lh-widget">
        <details class="lh-${this.type}" open>
          <summary>
            <input type="text" class="lh-widget-name" contenteditable="true" value="${this.displayName}">
          </summary>
          <div class="lh-widget-container"></div>
        </details>
      </div>
    `);
    $(parent).append(this.superContainer);
    this.container = this.superContainer.find(".lh-widget-container");

    // Save changes to name
    this.superContainer
      .find(".lh-widget-name")
      .on("click submit", function (e) {
        e.preventDefault();
        e.stopPropagation();
      })
      .on("keyup", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const nameElm = me.superContainer.find(".lh-widget-name");
        // Prevent blank name
        if (!nameElm.val().trim().length) {
          nameElm.val(me.displayName);
        } else {
          me.displayName = nameElm.val();
        }
      });

    this.contentData = {};
    this.loadData(contentData);

    console.log("Registered widget with id " + this.id);
  }

  /**
   * Do not override (override _preDestroy instead).
   * Removes the widget.
   */
  destroy() {
    this._preDestroy();
    this.superContainer.remove();
  }

  /**
   * Optional override.
   * Run before removing the widget.
   */
  _preDestroy() {}

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
      displayName: this.displayName,
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
