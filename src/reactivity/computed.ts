import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  // 是否可以执行
  private _dirty: boolean = true;
  // 暂存一下值
  private _value: any;
  // 传入的是一个函数
  private _effect: any;
  constructor(getter) {
    this._effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }
  get value() {
    if (this._dirty) {
      // 可以执行的时候就run一下
      this._dirty = false;
      // 使用effect的run方法不会触发schedule
      // 只有当getter内的响应式对象发生变化时才会触发schedule
      // 然后重置_dirty为true，再次执行run
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
