import { h } from "../../lib/be-vue.esm.js";
import { Foo } from "./Foo.js";

window.self = null;
export const App = {
  name: "App",
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
        onClick() {
          // set the onClick event
          console.log("click");
        },
        onMousedown() {
          // set the onMousedown event
          console.log("mousedown");
        },
      },
      // children
      // Array -> children -> two p tags
      // [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, "be-vue")]
      // related with this msg data
      // "hello, " + this.msg + "!"
      // component props
      [
        h("div", {}, "hi," + this.msg),
        h(Foo, {
          count: 1,
        }),
      ]
    );
  },

  setup() {
    return {
      msg: "be-vue",
    };
  },
};
