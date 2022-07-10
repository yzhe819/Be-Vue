var isObject = function (value) {
    return value !== null && typeof value === "object";
};

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
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
    var setup = Component.setup;
    if (setup) {
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // TODO 判断vnode 是不是一个 element
    // 是 element 那么就应该处理 element
    // 思考题： 如何去区分是 element 还是 component 类型呢？
    if (typeof vnode.type === "string") {
        // 是element节点
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 是对象，作为组件处理
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // 创建空的 dom 元素
    var el = document.createElement(vnode.type);
    var children = vnode.children;
    // children
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
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
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render();
    patch(subTree, container);
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount: function (rootContainer) {
            var vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
