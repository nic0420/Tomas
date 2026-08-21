import type { StateStorage } from 'zustand/middleware';

// Storage basado en IndexedDB para el estado persistido del admin.
// localStorage (~5MB) no alcanza para guardar el catálogo completo (~10MB).

const DB_NAME = 'tomas-admin-db';
const STORE_NAME = 'kv';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const req = fn(tx.objectStore(STORE_NAME));
    tx.oncomplete = () => {
      db.close();
      resolve(req.result);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error || new Error('Transacción abortada'));
    };
  });
}

export const idbStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const value = await withStore<string | undefined>('readonly', (s) => s.get(name));
      if (value != null) return value;
    } catch {
      // IndexedDB no disponible: caemos a localStorage
    }
    // Migración: datos guardados antes del cambio a IndexedDB
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    await withStore('readwrite', (s) => s.put(value, name));
  },
  removeItem: async (name) => {
    await withStore('readwrite', (s) => s.delete(name));
  },
};
