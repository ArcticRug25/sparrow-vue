import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: (event) => {}
  }

  component.emit = emit.bind(null, component)

  return component;
}

export function setupComponet(instance) {
  // TODO
  initProps(instance, instance.vnode.props)
  // initSlots()

  setupStatefulComponet(instance)
}

function setupStatefulComponet(instance) {
  const Component = instance.type;

  // ctx
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  const { setup } = Component;

  if (setup) {
    // function object
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });

    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  // function object
  // TODO function

  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type;

  instance.render = Component.render;
}
