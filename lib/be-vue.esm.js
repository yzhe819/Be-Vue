var isObject = function (value) {
    return value !== null && typeof value === "object";
};

var publicPropertyMap = {
    $el: function (i) { return i.vnode.el; },
};
var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        // setupState
        var setupState = instance.setupState;
        if (key in setupState) {
            return setupState[key];
        }
        var publicGetter = publicPropertyMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var Component = instance.type;
    console.log("创建 proxy");
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    console.log("处理 setup 结果");
    // function Object
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    console.log("完成组件初始化");
    var Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, container) {
    console.log("调用 patch");
    patch(vnode, container);
}
function patch(vnode, container) {
    // 判断 vnode 是不是一个 element
    // 是 element 那么就应该处理 element
    // 思考题： 如何去区分是 element 还是 component 类型呢？
    if (typeof vnode.type === "string") {
        // 是element节点
        console.log("处理 element");
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 是对象，作为组件处理
        console.log("处理 component");
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // 创建空的 dom 元素
    var el = (vnode.el = document.createElement(vnode.type));
    var children = vnode.children;
    // children
    if (typeof children === "string") {
        console.log("\u5904\u7406\u6587\u672C:".concat(children));
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        // 这里 children 就是个数组了，就需要依次调用 patch 递归来处理
        mountChildren(vnode, el);
    }
    // props
    var props = vnode.props;
    for (var key in props) {
        var val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(function (v) {
        console.log("mountChildren:", v);
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    var instance = createComponentInstance(initialVNode);
    console.log("\u521B\u5EFA\u7EC4\u4EF6\u5B9E\u4F8B:".concat(instance.type.name));
    // 给 instance 加工一下
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    console.log("".concat(instance.type.name, ":\u8C03\u7528 render,\u83B7\u53D6 subTree"));
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    patch(subTree, container);
    initialVNode.el = subTree.el;
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        el: null,
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
            // debugger;
            console.log("基于根组件创建 vnode");
            var vnode = createVNode(rootComponent);
            console.log("调用 render，基于 vnode 进行开箱");
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
