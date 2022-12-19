'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasChanged = (val, newValue) => {
    return !Object.is(val, newValue);
};
const hasOwn = (obj, key) => {
    return obj.hasOwnProperty(key);
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    // children
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // component + children object = slot
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (isObject(children)) {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        // function
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(_fn, scheduler) {
        this._fn = _fn;
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
    }
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
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // target -> key -> dep
    let depsMap = targetMap.get(target);
    // 初始化
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        // 收集的方法不能重复
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffect(dep);
}
function trackEffect(dep) {
    // 已经在 dep 中
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    // fn
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // extend
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function (target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 看看 res 是不是 object （嵌套）
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`key: ${key} set failed, because target is readonly`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}
function createReactiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} must be a Object`);
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

function emit(instance, event, ...args) {
    console.log('event', event);
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // setupState
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    // children object
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const vnode = children[key];
        // slot
        slots[key] = (props) => normalizeSlotValue(vnode(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    console.log('parent', parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        parent,
        subTree: {},
        providers: parent ? parent.providers : {},
        isMounted: false,
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponet(instance);
}
function setupStatefulComponet(instance) {
    const Component = instance.type;
    // ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // function object
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, proxyRefs(setupResult));
    }
}
function handleSetupResult(instance, setupResult) {
    // function object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // 存
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { providers, parent } = currentInstance;
        const parentProviders = parent.providers;
        // init
        if (providers === parentProviders) {
            providers = currentInstance.providers = Object.create(parentProviders);
        }
        providers[key] = value;
    }
}
function inject(key, defaultValue) {
    // 取
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const { parent } = currentInstance;
        const parentProviders = parent.providers;
        if (key in parentProviders) {
            return parentProviders[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先转换成 vnode
                // component -> vnode
                // 所有的逻辑操作 都会基于 vnode 做处理
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    function render(vnode, container) {
        // patch
        patch(null, vnode, container, null);
    }
    // n1 -> old
    // n2 -> new
    function patch(n1, n2, container, parentComponent) {
        const { shapeFlag, type } = n2;
        // 去处理组件
        // Fragment -> 只渲染 children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                // 判断 vnode 是不是 element
                // 是 element 那么就应该处理 element
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = document.createTextNode(children);
        container.appendChild(textNode);
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            // init
            mountElement(n2, container, parentComponent);
        }
    }
    function mountElement(vnode, container, parentComponent) {
        const el = vnode.el = hostCreateElement(vnode.type);
        // string | array
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            // vnode
            mountChildren(vnode, el, parentComponent);
        }
        // props
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, val);
        }
        // container.appendChild(el);
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            patch(null, v, container, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                const { proxy } = instance;
                // 虚拟节点树
                const subTree = instance.subTree = instance.render.call(proxy);
                // vnode -> patch
                // vnode -> element -> mountElement
                patch(null, subTree, container, instance);
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppApi(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    if (isOn(key)) {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, parent) {
    parent.append(el);
}
function isOn(key) {
    return /^on[A-Z]/.test(key);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert
});
function createApp(...args) {
    return renderer.createApp(...args);
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
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
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffect(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    // 是否是 ref 对象  ->  ref.value
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    // get set
    return new Proxy(objectWithRefs, {
        get(target, key) {
            // get -> age (ref) -> 返回 .value
            // not ref -> 返回 value
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
