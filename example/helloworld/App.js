import { h } from "../../lib/be-vue.esm.js";

export const App = {
  // 必须要写 render
  render() {
    // ui
    return h("div", "hi, " + this.msg);
  },

  setup() {
    return {
      msg: "be-vue",
    };
  },
};
