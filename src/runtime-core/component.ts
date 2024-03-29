import { proxyRefs } from "../index";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode, parent) {
  console.log('parent',parent)
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    parent,
    subTree: {},
    providers: parent ? parent.providers : {},
    isMounted: false,
    emit: () => {}
  }

  component.emit = emit.bind(null, component) as any;

  return component;
}

export function setupComponent(instance) {
  // TODO
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);

  setupStatefulComponet(instance)
}

function setupStatefulComponet(instance) {
  const Component = instance.type;

  // ctx
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  const { setup } = Component;

  if (setup) {
    // function object
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    setCurrentInstance(null);

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  // function object
  // TODO function

  if (typeof setupResult === 'object') {
    instance.setupState = proxyRefs(setupResult);
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type;

  instance.render = Component.render;
}

let currentInstance = null
export function getCurrentInstance() {
  return currentInstance;
}

export function setCurrentInstance(instance) {
  currentInstance = instance;
}
