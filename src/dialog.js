export default class Dialog {
  /**
   * Creates a Dialog showing content.
   * Only one Dialog will be displayed at a time (existing dialogs are removed).
   * Returns the Dialog form element.
   * The form's reset event will close the Dialog.
   * @param {HTML} content
   * @returns {<form>}
   */
  static show(content) {
    Dialog.close();

    $("body").append(`
      <div id="lh-dimmer" class="lh-no-save"/>
      <div id="lh-dialog-wrapper" class="lh-no-save">
        <form id="lh-dialog">
          <input type="reset" value="" class="lh-button-close" title="Close"/>
          ${content}
        </form>
      </div>
    `);

    const form = $("#lh-dialog");

    form.on("reset", Dialog.close);

    $("#lh-dialog-wrapper").on("click", function (e) {
      e.stopPropagation();
    });
    $("#lh-dimmer").on("click", function (e) {
      form.trigger("reset");
    });

    return form;
  }

  /**
   * Closes any open Dialogs.
   */
  static close(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    $("#lh-dialog-wrapper, #lh-dimmer").remove();
  }
}
