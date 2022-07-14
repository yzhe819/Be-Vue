import { h } from "../../lib/be-vue.esm.js";

window.self = null;
export const App = {
  // 必须要写 render
  render() {
    window.self = this;
    // ui
    return h(
      // div tag -> type
      "div",
      // props
      {
        id: "root", // set the id attribute
        class: ["red", "hard"], // set the class attribute
      },
      // children
      // Array -> children -> two p tags
      // [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "be-vue")]
      "hello, " + this.msg + "!"
    );
  },

  setup() {
    return {
      msg: "be-vue",
    };
  },
};
