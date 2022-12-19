import { Fragment, Text } from './vnode';
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // patch
  patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
  const { shapeFlag, type } = vnode;
  // 去处理组件
  // Fragment -> 只渲染 children
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break;
    case Text:
      processText(vnode, container)
      break;
    default:
      // 判断 vnode 是不是 element
      // 是 element 那么就应该处理 element
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
      break;
  }
}

function processText(vnode: any, container: HTMLElement) {
  const { children } = vnode;
  const textNode = document.createTextNode(children)
  container.appendChild(textNode);
}

function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent);
}

function processElement(vnode, container, parentComponent) {
  // init
  mountElement(vnode, container, parentComponent);
}

function mountElement(vnode, container, parentComponent) {
  const el: HTMLElement = vnode.el = document.createElement(vnode.type);

  // string | array
  const { children, shapeFlag } = vnode;

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // vnode
    mountChildren(vnode, el, parentComponent);
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

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach(v => {
    patch(v, container, parentComponent);
  })
}

function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(initialVNode, container, parentComponent) {
  const instance = createComponentInstance(initialVNode, parentComponent);

  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance, initialVNode, container) {
  const { proxy } = instance;
  // 虚拟节点树
  const subTree = instance.render.call(proxy);

  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container, instance);
  initialVNode.el = subTree.el;
}
