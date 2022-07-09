import { isObject } from "../shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadonly = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      // 是reactive数据吗?
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      // 是readonly数据吗?
      return isReadonly;
    }

    // Reflect直接调用对象内的方法,获取属性值
    const res = Reflect.get(target, key);

    // 用于嵌套对象转换功能 例如: { foo: { bar: 1 } } 里面的 foo 对象
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    if (!isReadonly) {
      // 依赖收集
      track(target, key);
    }
    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    // 更新值
    const res = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
  };
}

// 可变对象的handler
export const mutableHandlers = {
  get,
  set,
};

// 只读对象的handler
export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key) {
    console.warn(
      `key :"${String(key)}" set 失败，因为 target 是 readonly 类型`,
      target
    );
    return true;
  },
};
