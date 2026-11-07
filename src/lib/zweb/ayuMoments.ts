/**
 * zWeb · AyuMoments.
 *
 * Локальный «архив памяти» чатов:
 *  • сохранение удалённых сообщений — текст и метаданные остаются в IndexedDB
 *    ещё `keepDeletedDays` дней после удаления;
 *  • сохранение исходных версий отредактированных сообщений;
 *  • режим призрака — «прочитано» и «печатает» не уходят на сервер
 *    (с исключениями по чатам);
 *  • regex-фильтры, скрывающие сообщения из ленты по шаблону.
 *
 * Всё работает в фоне: включённая функция действует, даже если её экран не
 * открыт.
 */

import {appSettings} from '@stores/appSettings';
import rootScope from '@lib/rootScope';
import ListenerSetter from '@helpers/listenerSetter';

export type DeletedEntry = {
  key: string,
  peerId: string,
  mid: number,
  date: number,
  deletedAt: number,
  text: string,
  sender?: string,
  kind: 'deleted' | 'edited'
};

const DB_NAME = 'zweb-ayu-moments';
const STORE = 'messages';
const VERSION = 1;

let dbPromise: Promise<IDBDatabase>;

function openDb(): Promise<IDBDatabase> {
  if(dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if(!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, {keyPath: 'key'});
        store.createIndex('peerId', 'peerId');
        store.createIndex('deletedAt', 'deletedAt');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function put(entry: DeletedEntry) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllEntries(): Promise<DeletedEntry[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getEntriesForPeer(peerId: string): Promise<DeletedEntry[]> {
  const entries = await getAllEntries();
  return entries.filter((entry) => entry.peerId === peerId).sort((a, b) => b.deletedAt - a.deletedAt);
}

export async function deleteEntry(key: string) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllEntries() {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Удаляет записи старше `keepDeletedDays`. */
export async function pruneOld() {
  const days = appSettings.zweb?.keepDeletedDays || 30;
  if(!days) return;
  const maxAge = days * 86400_000;
  const now = Date.now();
  const entries = await getAllEntries();
  await Promise.all(entries.filter((entry) => now - entry.deletedAt > maxAge).map((entry) => deleteEntry(entry.key)));
}

function messageText(message: any): string {
  if(!message) return '';
  if(typeof(message.message) === 'string') return message.message;
  return message.message?.text || '';
}

function isGhostException(peerId: string) {
  const exceptions = (appSettings.zweb?.ghostExceptions || '')
  .split(/[,\s;]+/)
  .map((item) => item.trim())
  .filter(Boolean);
  return exceptions.includes(peerId);
}

export function isGhostActive(peerId?: string) {
  if(!appSettings.zweb?.ghostMode) return false;
  if(peerId && isGhostException(peerId)) return false;
  return true;
}

/** Применяет regex-фильтры: список шаблонов, по одному в строке. */
export function isMessageFiltered(text: string) {
  const raw = appSettings.zweb?.messageFilters?.trim();
  if(!raw || !text) return false;

  for(const line of raw.split('\n')) {
    const pattern = line.trim();
    if(!pattern) continue;
    try {
      if(new RegExp(pattern, 'i').test(text)) return true;
    } catch(err) {}
  }

  return false;
}

let started = false;
let listenerSetter: ListenerSetter;

/** Подписывается на удаление и редактирование сообщений. Вызывается один раз. */
export function startAyuMoments() {
  if(started) return;
  started = true;
  listenerSetter = new ListenerSetter();

  listenerSetter.add(rootScope)('history_delete', ({peerId, msgs}) => {
    if(!appSettings.zweb?.saveDeletedMessages) return;
    const managers = rootScope.managers;
    if(!managers) return;

    msgs.forEach((mid) => {
      let message: any;
      try {
        message = managers.appMessagesManager.getMessageByPeer(peerId, mid);
      } catch(err) {
        return;
      }
      if(!message || message._ !== 'message') return;

      put({
        key: `${peerId}_${mid}`,
        peerId: String(peerId),
        mid,
        date: message.date,
        deletedAt: Date.now(),
        text: messageText(message),
        sender: message.fromId ? String(message.fromId) : undefined,
        kind: 'deleted'
      }).catch(() => {});
    });
  });

  listenerSetter.add(rootScope)('message_edit', ({peerId, message}) => {
    if(!appSettings.zweb?.saveEditedMessages || !message) return;

    put({
      key: `${peerId}_${message.mid}_edited_${Date.now()}`,
      peerId: String(peerId),
      mid: message.mid,
      date: message.date,
      deletedAt: Date.now(),
      text: messageText(message),
      kind: 'edited'
    }).catch(() => {});
  });

  pruneOld().catch(() => {});
  setInterval(() => pruneOld().catch(() => {}), 86400_000);
}

export function stopAyuMoments() {
  listenerSetter?.removeAll();
  listenerSetter = undefined;
  started = false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Режим призрака: перехват «прочитано» и «печатает» на уровне менеджеров
// ─────────────────────────────────────────────────────────────────────────────

let ghostPatched = false;

/**
 * Оборачивает `setTyping` и `readHistory` так, чтобы при включённом режиме
 * призрака они не доходили до сервера.
 */
export function patchGhostMode() {
  if(ghostPatched) return;
  const messagesManager = rootScope.managers?.appMessagesManager as any;
  if(!messagesManager || messagesManager.__zwebPatched) return;

  ghostPatched = true;
  messagesManager.__zwebPatched = true;

  const originalSetTyping = messagesManager.setTyping;
  messagesManager.setTyping = function(peerId: any, ...args: any[]) {
    if(isGhostActive(String(peerId))) return Promise.resolve(false);
    return originalSetTyping.call(this, peerId, ...args);
  };

  const originalReadHistory = messagesManager.readHistory;
  messagesManager.readHistory = function({peerId, ...rest}: any) {
    if(isGhostActive(String(peerId))) return Promise.resolve();
    return originalReadHistory.call(this, {peerId, ...rest});
  };
}
