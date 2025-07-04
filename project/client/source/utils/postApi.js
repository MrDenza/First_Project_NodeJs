"use strict";

const isServer = typeof window === "undefined";
const API_BASE_URL = isServer ? process.env.API_BASE_URL || "http://localhost:3100" : "";
const PROXY_API_PATH = import.meta.env.VITE_PROXY_API_PATH || "";

export const postApi = async (uri, data = {}, options = {}) => {
    const {
        accept = "application/json",
        headers = {},
        contentType,
        method = "POST",
    } = options;

    // Определяем заголовки
    const fetchHeaders = new Headers({
        Accept: accept,
        ...headers,
    });

    let body;

    if (data instanceof FormData) {
        // Для FormData Content-Type не нужно ставить, браузер сам поставит с boundary
        body = data;

    } else if (data instanceof Blob || data instanceof File) {
        body = data;
        if (contentType) {
            fetchHeaders.set("Content-Type", contentType);
        } else if (!fetchHeaders.has("Content-Type")) {
            // Не ставим Content-Type, браузер сам поставит
        }
    } else if (typeof data === "string") {
        body = data;
        if (contentType) {
            fetchHeaders.set("Content-Type", contentType);
        } else if (!fetchHeaders.has("Content-Type")) {
            fetchHeaders.set("Content-Type", "text/plain;charset=UTF-8");
        }
    } else if (data && typeof data === "object") {
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
        method: method,
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
        responseBody = await response.text();
    }

    if (import.meta.env.DEV) {
        console.log("Ответ запроса POST ", responseBody);
    }

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