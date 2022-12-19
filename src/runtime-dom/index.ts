import { createRenderer } from '../runtime-core/index'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, key, val) {
  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, val);
  } else {
    el.setAttribute(key, val);
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
