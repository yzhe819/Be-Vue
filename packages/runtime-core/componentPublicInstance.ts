import { hasOwn } from "../shared/index";

const publicPropertyMap = {
  $el: (i) => i.vnode.el,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // setupState
    const { setupState, props } = instance;

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    const publicGetter = publicPropertyMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
