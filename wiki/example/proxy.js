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
