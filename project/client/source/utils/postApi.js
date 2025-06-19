"use strict";

const isServer = typeof window === "undefined";
const API_BASE_URL = isServer ? process.env.API_BASE_URL || "http://localhost:3100" : "";
const PROXY_API_PATH = import.meta.env.VITE_PROXY_API_PATH || "";

/**
 * Универсальная функция для POST-запросов к API.
 *
 * @param {string} uri - URI эндпоинта (относительно PROXY_API_PATH)
 * @param {object|FormData|string|null} [data={}] - Данные для отправки в теле запроса
 * @param {object} [options={}] - Дополнительные опции
 * @param {string} [options.accept="application/json"] - Значение заголовка Accept
 * @param {object} [options.headers={}] - Дополнительные заголовки
 * @param {string} [options.contentType] - Явно указать Content-Type (по умолчанию зависит от data)
 * @returns {Promise<any>} - Возвращает распарсенный ответ (json, text, blob)
 * @throws {Error} - В случае ошибки содержит статус и тело ответа
 */

export const postApi = async (uri, data = {}, options = {}) => {
    const {
        accept = "application/json",
        headers = {},
        contentType,
    } = options;

    // Определяем заголовки
    const fetchHeaders = new Headers({
        Accept: accept,
        ...headers,
    });

    // Определяем Content-Type, если не передан явно
    let body;

    if (data instanceof FormData) {
        // Для FormData Content-Type не нужно ставить, браузер сам поставит с boundary
        body = data;

    } else if (data instanceof Blob || data instanceof File) {
        body = data;
        // Если contentType передан явно, ставим его, иначе не ставим Content-Type,
        // чтобы браузер сам поставил (обычно File содержит свой тип)
        if (contentType) {
            fetchHeaders.set("Content-Type", contentType);
        } else if (!fetchHeaders.has("Content-Type")) {
            // Не ставим Content-Type, браузер сам поставит
        }
    } else if (typeof data === "string") {

        // Если передана строка, отправляем как есть
        body = data;
        if (contentType) {
            fetchHeaders.set("Content-Type", contentType);
        } else if (!fetchHeaders.has("Content-Type")) {
            fetchHeaders.set("Content-Type", "text/plain;charset=UTF-8");
        }
    } else if (data && typeof data === "object") {
        // Для объекта по умолчанию JSON
        body = JSON.stringify(data);
        if (contentType) {
            fetchHeaders.set("Content-Type", contentType);
        } else if (!fetchHeaders.has("Content-Type")) {
            fetchHeaders.set("Content-Type", "application/json;charset=UTF-8");
        }
    } else {
        // Если data null или undefined
        body = null;
    }

    const response = await fetch(`${API_BASE_URL}${PROXY_API_PATH}${uri}`, {
        method: "POST",
        headers: fetchHeaders,
        body,
    });

    const contentTypeResponse = response.headers.get("Content-Type") || "";

    let responseBody;
    if (contentTypeResponse.includes("application/json")) {
        responseBody = await response.json();
    } else if (contentTypeResponse.startsWith("text/")) {
        responseBody = await response.text();
    } else if (
        contentTypeResponse.includes("application/octet-stream") ||
        contentTypeResponse.includes("application/pdf") ||
        contentTypeResponse.startsWith("image/") ||
        contentTypeResponse.startsWith("audio/") ||
        contentTypeResponse.startsWith("video/")
    ) {
        responseBody = await response.blob();
    } else {
        // fallback
        responseBody = await response.text();
    }

    console.log("Ответ запроса", responseBody);

    if (!response.ok || (responseBody && responseBody.type === "error")) {
        let errorMessage = response.statusText || "Неизвестная ошибка";

        if (responseBody && typeof responseBody === "object") {
            if (responseBody.message) {
                errorMessage = responseBody.message;
            }

            const error = new Error(errorMessage);
            error.status = response.status || responseBody.status || 500;

            for (const [key, value] of Object.entries(responseBody)) {
                if (key !== 'message') {
                    error[key] = value;
                }
            }

            throw error;
        } else {
            const error = new Error(errorMessage);
            error.status = response.status || 500;
            throw error;
        }
    }
    return responseBody;
};

/* Использование:
try {
    const data = { name: "Иван", age: 30 };
    const result = await postApi("/users/create", data);
    console.log("Ответ сервера:", result);
} catch (err) {
    console.error("Ошибка запроса:", err.status, err.message, err.body, error.errors);
}
*/