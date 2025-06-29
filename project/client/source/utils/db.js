const DB_NAME = "PostImagesDB";
const STORE_NAME = "images";

// Инициализация базы данных
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = (event) => {
            reject(`IndexedDB error: ${event.target.error}`);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "key" });
            }
        };
    });
};

// Сохранение файла в IndexedDB
export const saveToIndexedDB = async (key, file) => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.put({ key, file });

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

// Получение файла из IndexedDB
export const getFromIndexedDB = async (key) => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onsuccess = (event) => {
            if (event.target.result) {
                resolve(event.target.result.file);
            } else {
                reject(new Error("File not found in IndexedDB"));
            }
        };

        request.onerror = (event) => reject(event.target.error);
    });
};

// Удаление файла из IndexedDB
export const deleteFromIndexedDB = async (key) => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};

// Очистка всех временных изображений
export const clearTempImages = async () => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
};
