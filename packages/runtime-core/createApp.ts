import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // debugger;
      console.log("基于根组件创建 vnode");
      const vnode = createVNode(rootComponent);
      console.log("调用 render, 基于 vnode 进行开箱");
      render(vnode, rootContainer);
    },
  };
}
