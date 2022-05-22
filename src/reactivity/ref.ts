import { isObject } from './../shared/index';
import { hasChanged } from "../shared";
import { isTracking, trackEffect, triggerEffects } from "./effect";
import { reactive } from './reactive';

class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
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
