import $ from "jquery";
import Quill from "quill";
import Widget from "../widget";
import "./notepad.css";

export default class WidgetNotepad extends Widget {
  constructor(args) {
    args.type = "notepad";
    super(args);
  }

  destroy() {
    this.editor.enable(false);
    this.editor = null;
    $(this.container).remove();
  }

  _draw() {
    // Draw Template
    $(this.container).html(`
      <details class="lh-notepad" open>
        <summary>Notepad</summary>
        <article class="lh-quill-field lh-quill-advanced"></article>
      </details>  
    `);

    // Draw content
    // When reloading this needs to be done asynchronously
    setTimeout(this._setupQuill.bind(this));
  }

  _getContentData() {
    this.contentData.quillData = this.editor.getContents();
    return this.contentData;
  }

  _setupQuill() {
    const options = {
      modules: {
        toolbar: [
          [
            { indent: "-1" },
            { indent: "+1" },
            "bold",
            "italic",
            "underline",
            { color: [] },
            "link",
            { list: "ordered" },
            { list: "bullet" },
            "image",
          ],
        ],
      },
      theme: "snow",
    };
    const child = $("<div></div>").get(0);
    $(this.container).find(".lh-quill-field").append(child);
    this.editor = new Quill(child, options);
    this.editor.setContents(this.contentData.quillData);
    this.editor.on("text-change", (e) =>
      $("#lh-event-watcher").trigger("change")
    );
  }
}
