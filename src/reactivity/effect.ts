import { extend } from "../shared";

let activeEffect: ReactiveEffect;
let shouldTrack: boolean;

export class ReactiveEffect {
  deps: Set<ReactiveEffect>[] = [];
  active = true;
  onStop?: () => void;
  constructor(private _fn, public scheduler?) { }

  run() {
    // 1、会收集依赖
    // shouldTrack 来区分
    if (!this.active) {
      return this._fn();
    }

    shouldTrack = true;
    activeEffect = this;

    const result = this._fn();
    // reset
    shouldTrack = false;

    return result;
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  })
  effect.deps.length = 0;
}

const targetMap = new Map();
export function track(target, key) {
  if (!isTracking()) return;

  // target -> key -> dep
  let depsMap = targetMap.get(target);
  // 初始化
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key) as Set<ReactiveEffect>;
  if (!dep) {
    // 收集的方法不能重复
    dep = new Set();
    depsMap.set(key, dep);
  }

  trackEffect(dep);
}

export function trackEffect(dep) {
  // 已经在 dep 中
  if (dep.has(activeEffect)) return;

  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) return;
  let dep: Set<ReactiveEffect> = depsMap.get(key);
  triggerEffects(dep);
}

export function triggerEffects(dep: Set<ReactiveEffect>) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  // fn
  const _effect = new ReactiveEffect(fn, options.scheduler);
  // extend
  extend(_effect, options);

  _effect.run();

  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
