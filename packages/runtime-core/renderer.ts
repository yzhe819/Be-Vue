import { isObject } from "../shared/index";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  console.log("调用 patch");
  patch(vnode, container);
}

function patch(vnode, container) {
  // 判断 vnode 是不是一个 element
  // 是 element 那么就应该处理 element
  // 思考题： 如何去区分是 element 还是 component 类型呢？
  if (typeof vnode.type === "string") {
    // 是element节点
    console.log("处理 element");
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    // 是对象，作为组件处理
    console.log("处理 component");
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  // 创建空的 dom 元素
  const el = (vnode.el = document.createElement(vnode.type));
  const { children } = vnode;

  // children
  if (typeof children === "string") {
    console.log(`处理文本:${children}`);
    el.textContent = children;
  } else if (Array.isArray(children)) {
    // 这里 children 就是个数组了，就需要依次调用 patch 递归来处理
    mountChildren(vnode, el);
  }

  // props
  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }

  container.append(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    console.log("mountChildren:", v);
    patch(v, container);
  });
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(initialVNode: any, container) {
  const instance = createComponentInstance(initialVNode);
  console.log(`创建组件实例:${instance.type.name}`);
  // 给 instance 加工一下
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode, container) {
  console.log(`${instance.type.name}:调用 render,获取 subTree`);
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  patch(subTree, container);

  initialVNode.el = subTree.el;
}
