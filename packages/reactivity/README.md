# @Be-Vue/reactivity

`reactivity`部分为`Be-Vue`里面的**响应式系统**，使用`Proxy`代理对象实现。



## reactivity功能

- [x]  reactive 的实现
- [x]  ref 的实现
- [x]  readonly 的实现
- [x]  computed 的实现
- [x]  track 依赖收集
- [x]  trigger 触发依赖
- [x]  支持 isReactive
- [x]  支持嵌套 reactive
- [ ]  支持 toRaw
- [x]  支持 effect.scheduler
- [x]  支持 effect.stop
- [x]  支持 isReadonly
- [x]  支持 isProxy
- [x]  支持 shallowReadonly
- [x]  支持 proxyRefs



## 功能实现

### reactive 的实现

`reactive`的实现是通过`createReactiveObject`方法创建一个`proxy`对象。将原始的数据`raw`和代理行为对象`mutableHandlers`传入，完成数据的响应式代理。

`baseHandler.ts`里面实现了`mutableHandlers`作为对可变对象的`handler`。简单的包含了两个部分，`get`和`set`:

- `get`是使用`createGetter`生成的，采用了默认参数， `isReadonly  = false, shallow = false`。
- `set`则是使用`createSetter`生成的，实现则简单了许多。直接是`Reflect.set`，然后再进行依赖触发，将访问的对象和`key`通过`trigger`来实现**派发更新**。最后将结果返回出去。



### effect的实现

`effect`函数会接受一个必须的依赖函数`fn`和几个optional的方法，例如`onStop`或者调度执行函数`scheduler`，然后返回`runner`函数。用户可以手动调用`runner`触发`fn`函数。

1. `effect`的实现是通过`effect.ts`内`effect`方法，它会向`ReactiveEffect`类传入`fn`和可选参数`scheduler`创建一个`_effect`对象。
2. 然后其余optional参数会通过`utils`里面的`extend`方法添加到`_effect`上。（通过`Object.assign`方法）
3. 初始化好了后，这里会调用一次`run`方法（`_effect.run();`）所以`fn`会在这里被第一次调用。
4. 然后会生成`runner`函数，`const runner: any = _effect.run.bind(_effect);`，将`_effect`绑定到`runner`上，`bind`对于的是`this`。 （`_effect`）
5. 然后给`runner`设置`effect`属性，`runner.effect = _effect;`，这里对应的是`stop`函数的实现，因为`stop`里会调用`runner.effect.stop();`。
6. 最后返回`runner`。



### track 依赖收集

在`effect.ts`内的`track()`方法，这个函数会接受响应式原始对象`target`和一个`key`值。并且依赖于一个全局变量`targetMap`

1. 调用时，首先判断是否正在追踪。（`shouldTrack && activeEffect !== undefined;`，`shouldTrack`会被被设置为`true`在`running`途中)
2. 如果不是，就直接返回结束调用。否则，从全局变量`targetMap`使用`target`获取其依赖表`depsMap`，然后再从这个依赖表中找到关联这个`key`的相关依赖集`dep` 。并且函数在这里维护数据结构，如果没有就创建新的，并且将其绑定。
3. 最后调用`trackEffects`并将找到的依赖传入。首先它会将`activeEffect` 收集到依赖集内，方便后续的调用。（如果之前`dep`里面就保存了当前的`effect`，就不用再收集了） 然后再反向添加依赖`dep`到对应的`ReactiveEffect`中的`deps`内。（这部分在清除依赖的时候很有用）



**注**：什么时候触发依赖收集？并且`isTracking()`什么时候会返回true？

- 当用户将`fn`传入到`effect`内，effect在初始化后会调用一次run函数。在调用`run`函数的时候，`shouldTrack = true; activeEffect = this;`， 这两个全局变量会被配置好。然后进入到正式的`fn`调用中。
- 在`fn`调用的时候，会访问相关的`reactive`值，这时候会调用`reactive`内的`get`函数，在该函数内会进行依赖收集，调用`track()`。
- 进入到`track()`内，这时的`isTracking()`会返回`true`，并且`activeEffect`就是我们所期望的。
- 完成依赖收集后，`get`函数会返回所得到的值。并且继续执行`fn`方法
- 等到执行完毕后，再次回到`ReactiveEffect`的`run`方法内，`shouldTrack`会被重置为`false`，再将返回值`return`出去。



### trigger 触发依赖

触发依赖会在值被设置的时候进行调用。

1. `trigger(target, key)`会使用传入的`target`和`key`值在`depsMap`内查找依赖，最后得到相关的依赖`dep`。
2. 然后将其传入到`triggerEffects(dep)`内，遍历`dep`的每一个`effect`对象，调用 `run` 或 `scheduler`。



### 支持 effect.stop & onStop

当外部调用`stop`方法的时候：

1. 首先判断一下这个`ReactiveEffect`的实例内的`active`是否为`false`，如果是直接返回跳过执行。
2. 否则就开始执行`stop()`的主逻辑，首先清理所有反向收集的依赖，直接清空实例内的`deps` （调用`cleanupEffect`）。
3. 如果有`onStop()`方法就调用。
4. 并且最后将`active`设置为`false`。



**注**：直接调用`runner()`，可以看到还是会存在变化。这种实现是通过一个判断实现。

```typescript
if (!this.active) {
	return this._fn();
}
```

这样调用`_fn()`运行的时候就没有将`shouldTrack = true; activeEffect = this;`设置好，进到`_fn`运行的时候，当其调用`get`函数的时候，依赖收集就不会将其重复收集进去 （`isTracking()`)。



### 支持 effect.scheduler

通过`effect`的第二个参数给定一个`scheduler`的函数，当`effect`第一次执行的时候，还会执行`fn`，但是不会执行`scheduler`调度函数。但当响应式对象更新的时候，会执行`scheduler`函数，但不会执行原先设置的`fn`。如果执行`runner`则会执行fn函数。

使用例子：

```typescript
const runner = effect(
	fn,
	{ scheduler }
);
```

1. 使用`effect`的`options`传入一个`scheduler`函数
2. 在`effect`函数初始化的时候，调用了`_effect.run`，f第一次执行。
3. 当依赖的响应式数据更新的时候，在`triggerEffects()`里面会判断是否存在`scheduler`函数
4. 如果有就只调用`scheduler`函数，否则会调用对应`ReactiveEffect`的`run`函数 -> `fn`

-

## 相关代码实现

### createGetter

`createGetter`可以传入两个参数，分别为`isReadonly`和`shallow`，并默认为`false`。`isReadonly`和`shallow`是用于标记创建的是否是`readonly`或者是`shallow`。 其中Get实现逻辑如下：

1. 判断是否为访问r`eactiveFlags`参数（`__v_isReactive`和`__v_isReadonly`，在`reactive.ts`里面定义这个enum）， 然后根据`isReadonly`的值返回。
2. 再使用`reflect.get`调用对象内`get`方法获取属性值。
3. 最后对获取到的属性值，根据`shallow`看是否直接返回。
4. 如果获得的属性值是一个`Object`，将会根据`isReadonly`递归调用`reactive`或者是`readonly`并将代理对象返回。
5. 最后是对不是`readonly`的对象进行依赖收集，然后返回。



### ReactiveEffect

`ReactiveEffect`有以下属性

```typescript
private _fn: any;
deps = [];
active = true;
onStop?: () => void;
scheduler?: () => void;
```

并且依赖于两个全局变量，`activeEffect`是用于表明当前激活的`effect`， `shouldTrack`来表示是否追踪。

```typescript
let activeEffect;
let shouldTrack = false;
```



相关流程：

- 首先`ReactiveEffect`的`constructor`会被传入`fn`和可选参数`scheduler`，然后`_fn`会保存`fn`。

- 当调用`run`方法的时候，首先会判断当前是否`active`。
  - 如果不是`active`的就直接返回函数`fn`执行的结果。
  - 否则会将当前的`ReactiveEffect`保存到`activeEffect`上，并且将`shouldTrack`设置为`true`。然后调用依赖函数，并且在结束调用的时候将`shouldTrack`重新设置为`false`。最后返回上述调用结果。（注：`effect`函数第一调用`run`的时候会发生）

