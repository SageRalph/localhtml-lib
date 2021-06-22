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
      $(this.container).append(`
        <div class="lh-browser-wrapper">
          <iframe src="${url}"></iframe>
        </div>`);
    }

    $(this.container)
      .find("form")
      .on("submit", function (e) {
        e.preventDefault();
        me.contentData.url = $(me.container).find("input[type=search]").val();
        me._draw();
      });
  }
}
