import { isObject } from "../shared/index";
import { createComponentInstance, setupComponet } from "./component";

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {
  // 去处理组件

  // 判断 vnode 是不是 element
  // 是 element 那么就应该处理 element
  if (typeof vnode.type === 'string') {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

function processElement(vnode, container) {
  // init
  mountElement(vnode, container);
}

function mountElement(vnode, container) {
  const el = document.createElement(vnode.type);

  // string | array
  const { children } = vnode;

  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    // vnode
    mountChildren(children, el);
  }

  // props
  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }

  container.appendChild(el);
}

function mountChildren(vnode, container) {
  vnode.forEach(v => {
    patch(v, container);
  })
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode);

  setupComponet(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  // 虚拟节点树
  const subTree = instance.render();

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container);
}

