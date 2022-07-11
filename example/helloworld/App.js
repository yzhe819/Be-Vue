import { h } from "../../lib/be-vue.esm.js";

export const App = {
  // 必须要写 render
  render() {
    // ui
    return h(
      "div", // div tag
      {
        id: "root", // set the id attribute
        class: ["red", "hard"], // set the class attribute
      },
      // Array -> children -> two p tags
      [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "be-vue")]
    );
  },

  setup() {
    return {
      msg: "be-vue",
    };
  },
};
