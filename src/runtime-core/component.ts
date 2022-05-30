export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type
  }

  return component;
}

export function setupComponet(instance) {
  // TODO
  // initProps()
  // initSlots()

  setupStatefulComponet(instance)
}

function setupStatefulComponet(instance) {
  const Component = instance.type;

  const { setup } = Component;

  if (setup) {
    // function object
    const setupResult = setup();

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
