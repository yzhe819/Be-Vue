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
