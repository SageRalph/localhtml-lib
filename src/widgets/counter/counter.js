import $ from "jquery";
import Widget from "../widget";
import "./counter.css";

export default class WidgetCounter extends Widget {
  constructor(args) {
    args.type = "counter";
    super(args);
  }

  _draw() {
    const me = this;

    // Draw Template
    $(this.container).html(`
      <form class="lh-counter-form">
        <input type="number" name="current" min="0" max="${me.contentData.limit}" value="${this.contentData.current}">
        <pre>/</pre>
        <input type="number" name="limit" min="0" value="${this.contentData.limit}">
      </form>
    `);

    const elmCurrent = $(this.container).find("[name=current]");
    const elmLimit = $(this.container).find("[name=limit]");

    // Setup actions
    elmLimit.on("change keyup", function (e) {
      const limit = elmLimit.val();
      me.contentData.limit = limit;
      elmCurrent.attr("max", limit);
      try {
        if (parseInt(elmCurrent.val()) > parseInt(limit)) {
          elmCurrent.val(limit).trigger("change");
        }
      } catch (err) {}
    });

    elmCurrent.on("change keyup", function (e) {
      me.contentData.current = elmCurrent.val();
    });
  }
}
