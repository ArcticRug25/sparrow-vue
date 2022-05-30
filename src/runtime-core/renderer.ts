import { createComponentInstance, setupComponet } from "./component";

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {
  // 去处理组件

  // 判断 vnode 是不是 element
  // 是 element 那么就应该处理 element
  // processElement(vnode, container);

  processComponent(vnode, container);
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);

  setupComponet(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance ,container) {
  // 虚拟节点树
  const subTree = instance.render();

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container);
}

