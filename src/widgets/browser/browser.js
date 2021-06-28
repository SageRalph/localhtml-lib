import $ from "jquery";
import Widget from "../widget";
import "./browser.css";

export default class WidgetBrowser extends Widget {
  constructor(args) {
    args.type = "browser";
    super(args);
  }

  _draw() {
    const me = this;

    const url = this.contentData.url || this.contentData.defaultURL || "";

    // Draw Template
    $(this.container).html(`
      <form>
        <input type="search" placeholder="Enter web address" value="${url}" />
        <input type="submit" value="GO"/>
      </form>
    `);

    // Draw content
    if (url) {
      const wrapper = $(`
        <div class="lh-browser-wrapper">
          <iframe src="${url}"></iframe>
        </div>
      `);

      if (this.contentData.height) {
        wrapper.height(this.contentData.height);
      }

      wrapper.appendTo(this.container);
    }

    $(this.container)
      .find("form")
      .on("submit", function (e) {
        e.preventDefault();
        me.loadData(me._getContentData());
      });
  }

  _getContentData() {
    this.contentData.url = $(this.container).find("input[type=search]").val();
    this.contentData.height = $(this.container)
      .find(".lh-browser-wrapper")
      .height();
    return this.contentData;
  }
}
