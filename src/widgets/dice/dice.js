import $ from "jquery";
import Widget from "../widget";
import "./dice.css";

export default class WidgetDice extends Widget {
  constructor(args) {
    args.type = "dicebox";
    super(args);
  }

  _draw() {
    const me = this;

    // Draw Template
    $(this.container).html(`
      <section class="lh-dice-picker">
        <button class="lh-dice" data-sides="20">d20</button>
        <button class="lh-dice" data-sides="12">d12</button>
        <button class="lh-dice" data-sides="10">d10</button>
        <button class="lh-dice" data-sides="8">d8</button>
        <button class="lh-dice" data-sides="6">d6</button>
        <button class="lh-dice" data-sides="4">d4</button>
      </section>
      <table class="lh-dice-history" title="Click on dice to roll them">
        <thead>
          <th><div>Dice</div></th>
          <th><div>Roll</div></th>
        </thead>
        <tbody>
          <tr class="hidden"><td>____</td><td>____</td></tr>
        </tbody>
      </table>
      <input type="reset" value="X" title="Clear History"></input>
    `);

    // Draw content
    if (this.contentData.history) {
      for (const row of this.contentData.history) {
        this._record(row);
      }
    } else {
      this.contentData.history = [];
    }

    // Setup actions
    $(this.container)
      .find(".lh-dice")
      .on("click", function (event) {
        me._diceRollRecord(parseInt(this.dataset.sides || "6"));
      });
    $(this.container)
      .find("input[type='reset']")
      .on("click", function (event) {
        me.loadData();
      });
  }

  /**
   * Adds to #lh-dice-history a random integer between 1 and sides (inclusive).
   * @param {Int} sides
   * @returns {Int} The value rolled
   */
  _diceRollRecord(sides) {
    const value = this._diceRoll(sides);
    this.contentData.history.push({ sides, value });
    this._record({ sides, value });
    return value;
  }

  _record({ sides, value }) {
    const row = `<tr class="lh-animation-flash-yellow"><td>d${sides}</td><td>${value}</td></tr>`;
    $(this.container).find(".lh-dice-history tbody").prepend(row);
  }

  /**
   * Returns a random integer between 1 and sides (inclusive).
   * @param {Int} sides
   * @returns {Int}
   */
  _diceRoll(sides) {
    const min = 1;
    const max = sides;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
