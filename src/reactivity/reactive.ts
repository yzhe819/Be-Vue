import { mutableHandlers, readonlyHandlers } from "./baseHandler";

// 对象类型枚举
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}

function createReactiveObject(target, baseHandler) {
  // Proxy对象由target明白对象、baseHandler代理行为的对象组成
  return new Proxy(target, baseHandler);
}
