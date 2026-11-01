// Úložiště může být blokované. Čtečka musí fungovat i bez něj.
export function createStorage(storage, prefix = 'aetheria-') {
  return {
    get(key, fallback = null) {
      try { return storage?.getItem(prefix + key) ?? fallback; }
      catch { return fallback; }
    },
    set(key, value) {
      try {
        if (!storage) return false;
        storage.setItem(prefix + key, String(value));
        return true;
      }
      catch { return false; }
    },
  };
}
export function browserStorage() {
  try { return createStorage(window.localStorage); }
  catch { return createStorage(null); }
}
