import $ from "jquery";
import { DiceRoll } from "rpg-dice-roller";
import Widget from "../widget";
import formulaHTML from "./formula.html";
import "./formula.css";
import Meta from "../../meta";

export default class WidgetFormula extends Widget {
  constructor(args) {
    args.type = "formula";
    super(args);
  }

  _draw() {
    const me = this;

    // Draw Template
    $(this.container).html(formulaHTML);

    const eqInput = $(this.container).find("[name=formula]");

    // Draw content
    eqInput.val(this.contentData.eqText);
    if (this.contentData.history) {
      for (const row of this.contentData.history) {
        this._record(row);
      }
    } else {
      this.contentData.history = [];
    }

    if (this.contentData.height) {
      $(this.container)
        .find(".lh-formula-history")
        .height(this.contentData.height);
    }

    // Setup actions
    $(this.container)
      .find(".lh-formula-form")
      .on("submit", function (e) {
        e.preventDefault();
        eqInput.removeClass("lh-invalid-field");
        try {
          me._calcRecord(eqInput.val());
        } catch (err) {
          eqInput.addClass("lh-invalid-field");
        }
      });
    // Clear history
    $(this.container)
      .find(".lh-formula-history-container input[type='reset']")
      .on("click", function (e) {
        e.preventDefault();
        delete me.contentData.history;
        me.loadData(me._getContentData());
      });
  }

  _getContentData() {
    this.contentData.height = $(this.container)
      .find(".lh-formula-history")
      .height();
    this.contentData.eqText = $(this.container).find("[name=formula]").val();
    return this.contentData;
  }

  /**
   * Adds to #lh-formula-history a the result of an formula, if computable.
   * @param {String} eq The formula
   * @returns {Number} The value calculated
   * @throws {Error} if incomputable
   */
  _calcRecord(eq) {
    const value = new DiceRoll(eq).toString().split(":")[1];
    this.contentData.history.push({ eq, value });
    this._record({ eq, value });
    return value;
  }

  _record({ eq, value }) {
    const me = this;
    const row = $(`<tr><td>${eq}</td><td>${value}</td></tr>`);

    $(this.container).find(".lh-formula-history tbody").prepend(row);
    Meta.flash(row);

    // When clicked set as current formula
    row.on("click", function (e) {
      $(me.container).find("[name=formula]").val(eq);
      Meta.flash(row);
    });
  }
}
