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



## 相关代码实现

### createGetter

`createGetter`可以传入两个参数，分别为`isReadonly`和`shallow`，并默认为`false`。`isReadonly`和shallow是用于标记创建的是否是`readonly`或者是`shallow`。 其中Get实现逻辑如下：

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

