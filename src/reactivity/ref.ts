import { isObject } from './../shared/index';
import { hasChanged } from "../shared";
import { isTracking, trackEffect, triggerEffects } from "./effect";
import { reactive } from './reactive';

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public __v_isRef = true;
  constructor(value) {
    this._rawValue = value;
    // value -> reactive
    this._value = convert(value);
    this.dep = new Set();
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      // 先修改最新的 _value 值
      this._value = convert(newValue);
      triggerEffects(this.dep);
    }
  }
}

function convert (value) {
  return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffect(ref.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref.__v_isRef;
}

export function unRef(ref) {
  // 是否是 ref 对象  ->  ref.value
  return isRef(ref) ? ref.value : ref;
}
