import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public __v_isRef = true;
  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
    this.dep = new Set();
  }
  get value() {
    // 依赖收集
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    // 如果值没有改变就无需触发依赖
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerEffects(this.dep);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__v_isRef;
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

// 在vue的模板中使用proxyRefs可以直接访问到ref的值
// 无需额外添加value
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      // 本质就是unRef, 判断一下是否是ref，如果是就返回ref.value
      // 否则返回原值
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        // 如果原有的值是ref并且传入的value不是ref，那么就把新值设置到ref上
        return (target[key].value = value);
      } else {
        // 否则直接设置新值
        return Reflect.set(target, key, value);
      }
    },
  });
}
