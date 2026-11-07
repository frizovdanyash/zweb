/**
 * zWeb · движок плагинов.
 *
 * Плагин — обычный JavaScript-файл с шапкой метаданных в комментарии:
 *
 *   @name        Моё расширение
 *   @id          my-extension
 *   @version     1.0.0
 *   @author      @username
 *   @description Что делает плагин
 *   @permissions network, messages.read
 *
 * и экспортом `module.exports = {onLoad(api) {}, onUnload() {}}`.
 *
 * Код исполняется в изолированной функции: `window`, `document` и `fetch`
 * подменены заглушками, а всё, что плагину действительно нужно, приходит через
 * `api` и только с разрешения пользователя. Обращение без разрешения пишется в
 * журнал и отклоняется.
 */

import {DEFAULT_PLUGIN_GRANT, ZWebPluginGrant} from '@config/zwebState';
import {appSettings, setAppSettings} from '@stores/appSettings';

export type PluginPermission =
  | 'network'
  | 'files'
  | 'messages.read'
  | 'messages.send'
  | 'intents'
  | 'settings';

export type PluginSetting = {
  key: string,
  title: string,
  type: 'toggle' | 'text' | 'number' | 'select',
  default?: any,
  values?: {value: string, title: string}[],
  description?: string
};

export type PluginMeta = {
  id: string,
  name: string,
  version: string,
  author: string,
  description: string,
  permissions: PluginPermission[],
  installedAt: number,
  source: 'file' | 'url' | 'paste',
  sourceUrl?: string,
  size: number
};

export type InstalledPlugin = PluginMeta & {
  code: string,
  settings?: PluginSetting[]
};

export const PERMISSION_TITLES: {[key in PluginPermission]: string} = {
  'network': 'Доступ в интернет',
  'files': 'Сохранение файлов',
  'messages.read': 'Чтение сообщений',
  'messages.send': 'Отправка и изменение сообщений',
  'intents': 'Открытие ссылок',
  'settings': 'Изменение настроек zWeb'
};

export const ALL_PERMISSIONS: PluginPermission[] = [
  'network', 'files', 'messages.read', 'messages.send', 'intents', 'settings'
];

const STORAGE_KEY = 'zweb_plugins_v1';
const LOGS_KEY = 'zweb_plugin_logs_v1';
const SETTINGS_PREFIX = 'zweb_plugin_settings_';
const MAX_LOG_ENTRIES = 500;

export type PluginLogEntry = {
  time: number,
  pluginId: string,
  kind: 'load' | 'unload' | 'error' | 'denied' | 'info',
  text: string
};

type Listener = () => void;
const listeners = new Set<Listener>();

function readPlugins(): InstalledPlugin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch(err) {
    return [];
  }
}

function writePlugins(plugins: InstalledPlugin[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plugins));
  listeners.forEach((listener) => listener());
}

export function subscribePlugins(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPlugins(): InstalledPlugin[] {
  return readPlugins();
}

export function getPlugin(id: string) {
  return readPlugins().find((plugin) => plugin.id === id);
}

export function getGrant(id: string): ZWebPluginGrant {
  return {...DEFAULT_PLUGIN_GRANT, ...(appSettings.zweb?.pluginGrants?.[id] || {})};
}

export function setGrant(id: string, patch: Partial<ZWebPluginGrant>) {
  setAppSettings('zweb', 'pluginGrants', id, {...getGrant(id), ...patch});
}

export function pushLog(entry: Omit<PluginLogEntry, 'time'>) {
  let logs: PluginLogEntry[] = [];
  try {
    logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
  } catch(err) {}
  logs.push({...entry, time: Date.now()});
  if(logs.length > MAX_LOG_ENTRIES) logs = logs.slice(logs.length - MAX_LOG_ENTRIES);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  listeners.forEach((listener) => listener());
}

export function getLogs(): PluginLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
  } catch(err) {
    return [];
  }
}

export function clearLogs() {
  localStorage.removeItem(LOGS_KEY);
  listeners.forEach((listener) => listener());
}

/** Разбирает шапку `@name` / `@permissions` и прочие теги из комментария. */
export function parseMeta(code: string, fallbackId?: string): Omit<PluginMeta, 'installedAt' | 'source' | 'size'> {
  const head = code.slice(0, 4000);
  const pick = (tag: string) => {
    const match = head.match(new RegExp('@' + tag + '\\s+([^\\n\\r*]+)', 'i'));
    return match ? match[1].trim() : '';
  };

  const name = pick('name') || 'Без названия';
  const id = (pick('id') || fallbackId || name.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')).slice(0, 64);
  const version = pick('version') || '1.0.0';
  const author = pick('author') || 'неизвестен';
  const description = pick('description') || '';

  const permissions = (pick('permissions') || '')
  .split(/[,\s]+/)
  .map((perm) => perm.trim())
  .filter((perm): perm is PluginPermission => (ALL_PERMISSIONS as string[]).includes(perm));

  return {id, name, version, author, description, permissions};
}

export function pluginSettingsKey(id: string) {
  return SETTINGS_PREFIX + id;
}

export function getPluginSettings(id: string): {[key: string]: any} {
  try {
    return JSON.parse(localStorage.getItem(pluginSettingsKey(id)) || '{}');
  } catch(err) {
    return {};
  }
}

export function setPluginSetting(id: string, key: string, value: any) {
  const settings = getPluginSettings(id);
  settings[key] = value;
  localStorage.setItem(pluginSettingsKey(id), JSON.stringify(settings));
  listeners.forEach((listener) => listener());
}

export function installPlugin(code: string, source: PluginMeta['source'], sourceUrl?: string): InstalledPlugin {
  const meta = parseMeta(code, sourceUrl ? sourceUrl.split('/').pop()?.replace(/\.[^.]+$/, '') : undefined);
  const plugin: InstalledPlugin = {
    ...meta,
    installedAt: Date.now(),
    source,
    sourceUrl,
    size: code.length,
    code
  };

  const plugins = readPlugins().filter((item) => item.id !== plugin.id);
  plugins.push(plugin);
  writePlugins(plugins);
  setGrant(plugin.id, {enabled: true});
  pushLog({pluginId: plugin.id, kind: 'info', text: `Установлен (${source})`});

  if(!appSettings.zweb.pluginsSafeMode && appSettings.zweb.pluginsEnabled) {
    loadPlugin(plugin.id).catch(() => {});
  }

  return plugin;
}

export function uninstallPlugin(id: string) {
  unloadPlugin(id);
  writePlugins(readPlugins().filter((plugin) => plugin.id !== id));
  localStorage.removeItem(pluginSettingsKey(id));
  pushLog({pluginId: id, kind: 'info', text: 'Удалён'});
}

// ─────────────────────────────────────────────────────────────────────────────
// Исполнение
// ─────────────────────────────────────────────────────────────────────────────

export type ZWebPluginApi = {
  version: string,
  pluginId: string,
  permissions: PluginPermission[],
  has(permission: PluginPermission): boolean,
  on(event: string, handler: (...args: any[]) => void): () => void,
  settings: {
    get(key: string): any,
    set(key: string, value: any): void,
    all(): {[key: string]: any}
  },
  storage: {
    get(key: string): string | null,
    set(key: string, value: string): void,
    remove(key: string): void
  },
  ui: {
    toast(text: string): void,
    confirm(title: string, description?: string): Promise<boolean>
  },
  messages: {
    send(peerId: string, text: string): Promise<any>,
    delete(peerId: string, mids: number[]): Promise<any>,
    onNew(handler: (message: any) => void): () => void
  },
  network: {
    fetch(input: string, init?: RequestInit): Promise<Response>
  },
  files: {
    save(name: string, content: Blob | string): void
  },
  intents: {
    open(url: string): void
  }
};

type PluginModule = {
  onLoad?: (api: ZWebPluginApi) => void | Promise<void>,
  onUnload?: () => void,
  settings?: PluginSetting[]
};

const activePlugins = new Map<string, {module: PluginModule, disposers: (() => void)[]}>();

function makeApi(plugin: InstalledPlugin): ZWebPluginApi {
  const grant = getGrant(plugin.id);
  const has = (permission: PluginPermission) => {
    if(appSettings.zweb.pluginsUnsafeMode) return true;
    const key = permission === 'messages.read' ? 'messagesRead' :
      permission === 'messages.send' ? 'messagesSend' : permission;
    return !!(grant as any)[key];
  };

  const deny = (permission: PluginPermission) => {
    pushLog({pluginId: plugin.id, kind: 'denied', text: `Отклонено: ${permission}`});
    throw new Error(`zWeb: плагину "${plugin.name}" не разрешено: ${PERMISSION_TITLES[permission]}`);
  };

  const disposers: (() => void)[] = [];
  activePlugins.get(plugin.id)?.disposers.push(...disposers);

  const managers = () => (window as any).rootScope?.managers;

  return {
    version: '1.0',
    pluginId: plugin.id,
    permissions: plugin.permissions,
    has,
    on(event, handler) {
      const rootScope = (window as any).rootScope;
      if(!rootScope?.addEventListener) return () => {};
      const wrapped = (...args: any[]) => handler(...args);
      rootScope.addEventListener(event, wrapped);
      const off = () => rootScope.removeEventListener(event, wrapped);
      disposers.push(off);
      return off;
    },
    settings: {
      get: (key) => getPluginSettings(plugin.id)[key],
      set: (key, value) => setPluginSetting(plugin.id, key, value),
      all: () => getPluginSettings(plugin.id)
    },
    storage: {
      get: (key) => localStorage.getItem(`zweb_plugin_${plugin.id}_${key}`),
      set: (key, value) => localStorage.setItem(`zweb_plugin_${plugin.id}_${key}`, value),
      remove: (key) => localStorage.removeItem(`zweb_plugin_${plugin.id}_${key}`)
    },
    ui: {
      toast(text) {
        import('@components/toast').then(({toast}) => toast(text)).catch(() => {});
      },
      async confirm(title, description) {
        const {default: confirmationPopup} = await import('@components/confirmationPopup');
        try {
          await confirmationPopup({
            titleLangKey: title as any,
            descriptionLangKey: description as any,
            button: {langKey: 'OK' as any}
          });
          return true;
        } catch(err) {
          return false;
        }
      }
    },
    messages: {
      send(peerId, text) {
        if(!has('messages.send')) return Promise.reject(deny('messages.send'));
        const m = managers();
        if(!m) return Promise.reject(new Error('zWeb: менеджеры недоступны'));
        return m.appMessagesManager.sendText({peerId: peerId as any, text});
      },
      delete(peerId, mids) {
        if(!has('messages.send')) return Promise.reject(deny('messages.send'));
        const m = managers();
        if(!m) return Promise.reject(new Error('zWeb: менеджеры недоступны'));
        return m.appMessagesManager.deleteMessages(peerId as any, mids, true);
      },
      onNew(handler) {
        if(!has('messages.read')) return () => deny('messages.read');
        const rootScope = (window as any).rootScope;
        if(!rootScope?.addEventListener) return () => {};
        const wrapped = ({message}: any) => handler(message);
        rootScope.addEventListener('history_append', wrapped);
        const off = () => rootScope.removeEventListener('history_append', wrapped);
        disposers.push(off);
        return off;
      }
    },
    network: {
      fetch(input, init) {
        if(!has('network')) return Promise.reject(deny('network'));
        return window.fetch(input, init);
      }
    },
    files: {
      save(name, content) {
        if(!has('files')) return deny('files');
        const blob = typeof(content) === 'string' ? new Blob([content], {type: 'text/plain'}) : content;
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = name;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
    },
    intents: {
      open(url) {
        if(!has('intents')) return deny('intents');
        import('@helpers/dom/safeWindowOpen').then(({default: safeWindowOpen}) => safeWindowOpen(url));
      }
    }
  };
}

/** Песочница: `window`, `document` и сеть внутри плагина недоступны напрямую. */
function evaluatePlugin(plugin: InstalledPlugin): PluginModule {
  const blocked = (what: string): undefined => {
    pushLog({pluginId: plugin.id, kind: 'denied', text: `Обращение к ${what} отклонено`});
    return undefined;
  };

  const sandboxedWindow = new Proxy({}, {
    get(_, key) {
      return blocked(String(key));
    }
  });

  const factory = new Function(
    'module',
    'exports',
    'window',
    'globalThis',
    'document',
    'fetch',
    'XMLHttpRequest',
    'localStorage',
    '"use strict";\n' + plugin.code
  );

  const module = {exports: {} as any};
  factory(module, module.exports, sandboxedWindow, sandboxedWindow, undefined, undefined, undefined, undefined);

  const exported = module.exports?.default || module.exports;
  if(!exported || typeof(exported) !== 'object') {
    throw new Error('zWeb: плагин должен экспортировать объект (module.exports = {...})');
  }

  return exported as PluginModule;
}

export async function loadPlugin(id: string) {
  const plugin = getPlugin(id);
  if(!plugin) throw new Error('zWeb: плагин не найден');
  if(activePlugins.has(id)) return;
  if(!getGrant(id).enabled) return;

  let module: PluginModule;
  try {
    module = evaluatePlugin(plugin);
  } catch(err) {
    pushLog({pluginId: id, kind: 'error', text: (err as Error).message});
    throw err;
  }

  activePlugins.set(id, {module, disposers: []});
  const api = makeApi(plugin);

  try {
    await module.onLoad?.(api);
    pushLog({pluginId: id, kind: 'load', text: 'Загружен'});
  } catch(err) {
    pushLog({pluginId: id, kind: 'error', text: (err as Error).message});
  }
}

export function unloadPlugin(id: string) {
  const active = activePlugins.get(id);
  if(!active) return;
  try {
    active.module.onUnload?.();
  } catch(err) {
    pushLog({pluginId: id, kind: 'error', text: (err as Error).message});
  }
  active.disposers.forEach((dispose) => {
    try {
      dispose();
    } catch(err) {}
  });
  activePlugins.delete(id);
  pushLog({pluginId: id, kind: 'unload', text: 'Выгружен'});
}

export function isPluginActive(id: string) {
  return activePlugins.has(id);
}

export function reloadPlugin(id: string) {
  unloadPlugin(id);
  return loadPlugin(id);
}

/** Старт движка: вызывается после входа в аккаунт. */
export function bootPlugins() {
  if(!appSettings.zweb?.pluginsEnabled) return;
  if(appSettings.zweb.pluginsSafeMode) {
    pushLog({pluginId: '*', kind: 'info', text: 'Безопасный режим: плагины не загружены'});
    return;
  }

  for(const plugin of getPlugins()) {
    if(!getGrant(plugin.id).enabled) continue;
    loadPlugin(plugin.id).catch((err) => console.error('zWeb plugin', plugin.id, err));
  }
}

export function stopAllPlugins() {
  for(const id of Array.from(activePlugins.keys())) unloadPlugin(id);
}
