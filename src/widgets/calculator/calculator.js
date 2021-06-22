import $ from "jquery";
import Widget from "../widget";
import "./calculator.css";
import calculatorHTML from "./calculator.html";

export default class WidgetCalculator extends Widget {
  constructor(args) {
    args.type = "calculator";
    super(args);
  }

  _getContentData() {
    this.contentData.display = $(this.container).find("[name=display]").val();
    return this.contentData;
  }

  _draw() {
    const me = this;

    // Draw Template
    $(this.container).html(calculatorHTML);

    const display = $(this.container).find("[name=display]");

    // Draw content
    display.val(this.contentData.display || "");

    // Setup actions
    // Validate
    display.on("change, keydown", function (e) {
      display.removeClass("lh-invalid-field");
      me._validateDisplay();
    });

    // Calculate on submit
    $(this.container)
      .find("form")
      .on("reset", function (e) {
        display.removeClass("lh-invalid-field");
      })
      .on("submit", function (e) {
        e.preventDefault();
        try {
          // Only update display if result is a number (e.g. NOT "Infinity")
          const result = "" + eval(display.val());
          if (isNaN(result.slice(-1))) throw new Error("Bad value");
          display.val(result);
        } catch (err) {
          display.addClass("lh-invalid-field");
        }
        return false;
      });

    // Add to display on button press
    $(this.container)
      .find("input[type=button]")
      .on("click", function (e) {
        e.preventDefault();
        const value = "" + $(this).val();
        display.val(display.val() + value);
        display.trigger("change");
      });
  }

  _validateDisplay() {
    const allowedChars = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "-",
      "+",
      "*",
      "/",
      ".",
    ];
    const display = $(this.container).find("[name=display]");
    const value = display.val();

    const n = value.slice(-1); // new last symbol
    const o = value.length > 1 ? value.slice(-2, -1) : false; // old last symbol

    // Reject illegal characters
    if (!allowedChars.includes(n)) {
      display.val(value.slice(0, -1));
    }

    // Only a digit or "-" can follow a non-digit, "-" cannot follow itself
    if (isNaN(n) && (o === false || isNaN(o)) && (n !== "-" || o === "-")) {
      if (o === false) {
        // Clear display if invalid 1st char
        display.val("");
      } else {
        // Otherwise replace old last symbol with the new one
        display.val(value.slice(0, -2) + n);
        if (o === "-") {
          // If that symbol was a "-", check it's a valid replacement
          this._validateDisplay();
        }
      }
    }
  }
}
