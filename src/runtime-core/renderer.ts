import { Fragment, Text } from './vnode';
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {
  const { shapeFlag, type } = vnode;
  // 去处理组件
  // Fragment -> 只渲染 children
  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break;
    case Text:
      processText(vnode, container)
      break;
    default:
      // 判断 vnode 是不是 element
      // 是 element 那么就应该处理 element
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
      }
      break;
  }
}

function processText(vnode: any, container: HTMLElement) {
  const { children } = vnode;
  const textNode = document.createTextNode(children)
  container.appendChild(textNode);
}

function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container);
}

function processElement(vnode, container) {
  // init
  mountElement(vnode, container);
}

function mountElement(vnode, container) {
  const el: HTMLElement = vnode.el = document.createElement(vnode.type);

  // string | array
  const { children, shapeFlag } = vnode;

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // vnode
    mountChildren(vnode, el);
  }

  // props
  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    if (isOn(key)) {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, val);
    } else {
      el.setAttribute(key, val);
    }
  }

  container.appendChild(el);
}

function isOn(key: string) {
  return /^on[A-Z]/.test(key);
}

function mountChildren(vnode, container) {
  vnode.children.forEach(v => {
    patch(v, container);
  })
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function mountComponent(initialVNode, container) {
  const instance = createComponentInstance(initialVNode);

  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance;
  // 虚拟节点树
  const subTree = instance.render.call(proxy);

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container);
  initialVNode.el = subTree.el;
}
