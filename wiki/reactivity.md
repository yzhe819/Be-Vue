# reactivity



## Vue3响应式原理

`Vue3`的响应式实现是通过`proxy`拦截数据的读取和更新（数据劫持）来实现数据的响应化。而`Vue2`的实现则是使用`Object.defineProperty`。性能上是`proxy`更优，并且`proxy`可以直接监听对象而非属性。而`Vue2`是给已存在的属性添加`getter`和`setter`，并通过遍历对象属性直接修改。

这是一个最简单的数据响应化例子：

```javascript
let user = {
  age: 1,
};

const proxy = new Proxy(user, {
  get(target, key) {
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
  },
});

console.log("The age:", proxy.age); // The age: 1
console.log("The original user age:", user.age); // The original user age: 1
proxy.age = 2;
console.log("The new age:", proxy.age); // The new age: 2
console.log("The new user age:", user.age); // The new user age: 2
```

- `Proxy`拦截对象的读取和更新操作，然后执行操作处理。我们没有直接操作源对象`user`，而是通过对象的代理对象`proxy`。
- 代理对象数据发生改变后，原对象的数据也会相应改变。



`Reflect`能直接调用对象的内部方法，和`proxy`配合使用：

```javascript
let user = {
  age: 1,
};

const proxy = new Proxy(user, {
  get(target, key) {
    return Reflect.get(target, key);
  },
  set(target, key, value) {
    const res = Reflect.set(target, key, value);
    return res;
  },
});

console.log("The age:", proxy.age); // The age: 1
console.log("The original user age:", user.age); // The original user age: 1
proxy.age = 2;
console.log("The new age:", proxy.age); // The new age: 2
console.log("The new user age:", user.age); // The new user age: 2
```

- `Reflect.get()`方法与从对象`target[key]`中读取属性类似，但它是通过一个函数执行来操作的。
- 静态方法 `Reflect.set()` 工作方式就像在一个对象上设置一个属性。
- [Reflect.get()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/get) & [Reflect.set()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Reflect/set)



## 副作用函数 - effect

副作用函数`effect`用来跟踪正在运行的函数，它将被传入一个函数`fn`。但`fn`依赖的其他数据变化时，重新运行`fn`。注意当第一次设置effect的时候，`effect`会被调用一次。



下面是一个`effect`的例子:

```javascript
let dummy = 0;
const counter = reactive({ num: 1 });
effect(() => (dummy = counter.num));
console.log(dummy); // 1
counter.value = 2;
console.log(dummy); // 2
```

`effect`传入的`() => (dummy = counter.num)`里面依赖了响应式数据`counter`，当我们将它的值设置为2的时候，上述函数会被再次调用，从而更新了`dummy`的值。



要做到根据依赖的数据变化时调用方法，我们需要做**依赖收集**和**依赖触发**。依赖收集是用于将数据和更新函数联系起来，而依赖触发则是从数据的依赖关系里面找到更新函数，然后触发它们。



## 依赖收集 & 依赖触发

To Be Continued...



## Vue2数据双向绑定

使用`Object.definedProperty`方法，俗称**属性拦截器**。兼容性好，支持 IE9，而 Proxy 的存在浏览器兼容性问题。



下面是基础调用的例子：

```javascript
let user = {
  name: "be-vue",
};

Object.defineProperty(user, "age", {
  value: 18,
  enumerable: true, // 设置为可枚举的
  writable: true, // 设置为可写的， 需要设置为true才能让新增的属性被修改
  configurable: true, // 设置为可配置的， 需要设置为true才能让新增的属性被删除
});
console.log(user); // { name: 'be-vue', age: 18 }

user.name = "hello world"; // 更新原有属性
console.log(user); // { name: 'hello world', age: 18 }

user.age = 22; // 更新新增属性
console.log(user); // { name: 'hello world', age: 22 }

delete user.age; // 删除属性
console.log(user); // { name: 'hello world' }
```



我们也可以使用`get`和`set`访问器来进行数据的获取和设置

- `set()`一旦属性被重新赋值，此方法被自动调用。
- `get()`一旦属性被访问读取，此方法被自动调用。

