import { getCurrentInstance } from "./component";

export function provide(key, value) {
  // 存
  const currentInstance = getCurrentInstance() as unknown as any;
  if (currentInstance) {
    let { providers, parent } = currentInstance;
    const parentProviders = parent.providers;

    // init
    if (providers === parentProviders) {
      providers = currentInstance.providers = Object.create(parentProviders);
    }

    providers[key] = value
  }
}

export function inject(key, defaultValue) {
  // 取
  const currentInstance = getCurrentInstance();

  if (currentInstance) {
    const { parent } = currentInstance as Record<string, any>;
    const parentProviders = parent.providers;

    if (key in parentProviders) {
      return parentProviders[key];
    } else if (defaultValue) {
      if (typeof defaultValue === 'function') {
        return defaultValue();
      }
      return defaultValue;
    }
  }

}
