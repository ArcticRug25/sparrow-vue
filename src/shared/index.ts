export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === 'object';
}

export const hasChanged = (val, newValue) => {
  return !Object.is(val, newValue);
}

export const hasOwn = (obj, key) => {
  return obj.hasOwnProperty(key)
}
