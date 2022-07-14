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



## 代码实现

### reactive 的实现

`reactive`的实现是通过`createReactiveObject`方法创建一个`proxy`对象。将原始的数据`raw`和代理行为对象`mutableHandlers`传入，完成数据的响应式代理。

`baseHandler.ts`里面实现了`mutableHandlers`作为对可变对象的`handler`。简单的包含了两个部分，`get`和`set`:

- `get`是使用`createGetter`生成的，采用了默认参数， `isReadonly  = false, shallow = false`。
- `set`则是使用`createSetter`生成的，实现则简单了许多。直接是`Reflect.set`，然后再进行依赖触发，将访问的对象和`key`通过`trigger`来实现**派发更新**。最后将结果返回出去。



## 相关代码的实现

### createGetter

`createGetter`可以传入两个参数，分别为`isReadonly`和`shallow`，并默认为`false`。`isReadonly`和shallow是用于标记创建的是否是`readonly`或者是`shallow`。 其中Get实现逻辑如下：

1. 判断是否为访问r`eactiveFlags`参数（`__v_isReactive`和`__v_isReadonly`，在`reactive.ts`里面定义这个enum）， 然后根据`isReadonly`的值返回。
2. 再使用`reflect.get`调用对象内`get`方法获取属性值。
3. 最后对获取到的属性值，根据`shallow`看是否直接返回。
4. 如果获得的属性值是一个`Object`，将会根据`isReadonly`递归调用`reactive`或者是`readonly`并将代理对象返回。
5. 最后是对不是`readonly`的对象进行依赖收集，然后返回。
