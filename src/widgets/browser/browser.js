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

    const isOpen = $(this.container).find(".lh-browser").prop("open");

    // Draw Template
    $(this.container).html(`
      <details class="lh-browser" ${isOpen ? "open" : ""}>
        <summary>Browser</summary>
        <form>
          <input type="search" placeholder="Enter web address" value="${
            this.contentData.url || this.contentData.defaultURL || ""
          }" />
          <input type="submit" value="GO"/>
      </details>  
    `);

    // Draw content if open
    if (isOpen && this.contentData.url) {
      $(this.container)
        .find(".lh-browser")
        .append(`
        <div class="lh-browser-wrapper">
          <iframe src="${this.contentData.url}"></iframe>
        </div>`);
    }

    // Setup actions
    $(this.container)
      .find(".lh-browser summary")
      .on("click", function (e) {
        $(me.container).find(".lh-browser").prop("open", !isOpen);
        me._draw();
      });

    $(this.container)
      .find(".lh-browser form")
      .on("submit", function (e) {
        e.preventDefault();
        me.contentData.url = $(me.container)
          .find(".lh-browser input[type=search]")
          .val();
        me._draw();
      });
  }
}
