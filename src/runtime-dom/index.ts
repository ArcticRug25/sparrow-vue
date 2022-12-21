import { createRenderer } from '../runtime-core/index'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el: HTMLElement, key, prevVal, nextVal) {
  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, nextVal);
  } else {
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, nextVal);
    }
  }
}

function insert(el, parent) {
  parent.append(el)
}

function isOn(key: string) {
  return /^on[A-Z]/.test(key);
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core/index';
