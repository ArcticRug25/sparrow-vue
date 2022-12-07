import { ShapeFlags } from "../shared/shapeFlags";

export function initSlots(instance, children) {
  // children object
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots);
  }
}

function normalizeObjectSlots(children: any, slots) {
  for (const key in children) {
    const vnode = children[key];

    // slot
    slots[key] = (props) => normalizeSlotValue(vnode(props));
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value];
}
