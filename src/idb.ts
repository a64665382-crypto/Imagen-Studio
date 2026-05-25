export const set = (key: string, val: any) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("whisk_db", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("store");
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("store")) {
         resolve(false);
         return;
      }
      const tx = db.transaction("store", "readwrite");
      tx.objectStore("store").put(val, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
};

export const get = (key: string) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("whisk_db", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("store");
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("store")) {
         resolve(null);
         return;
      }
      const tx = db.transaction("store", "readonly");
      try {
          const req = tx.objectStore("store").get(key);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
      } catch(e) { resolve(null); }
    };
    request.onerror = () => reject(request.error);
  });
};
