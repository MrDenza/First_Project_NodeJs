"use strict";

const isServer = typeof window === "undefined";
const API_BASE_URL = isServer ? process.env.API_BASE_URL || "http://localhost:3060" : "";
const PROXY_API_PATH = import.meta.env.VITE_PROXY_API_PATH || "";

export const getApi = async (
    uri,
    params = {},
    options = {}
) => {
    const { accept = "application/json", headers = {} } = options;

    // Сериализация параметров в query string
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}${PROXY_API_PATH}${uri}${queryString ? `?${queryString}` : ""}`;

    const fetchHeaders = new Headers({
        Accept: accept,
        ...headers,
    });

    const response = await fetch(url, {
        method: "GET",
        headers: fetchHeaders,
    });

    const contentType = response.headers.get("Content-Type") || "";

    let responseBody;
    if (contentType.includes("application/json")) {
        responseBody = await response.json();
    } else if (contentType.startsWith("text/")) {
        responseBody = await response.text();
    } else if (
        contentType.includes("application/octet-stream") ||
        contentType.includes("application/pdf") ||
        contentType.startsWith("image/") ||
        contentType.startsWith("audio/") ||
        contentType.startsWith("video/")
    ) {
        responseBody = await response.blob();
    } else {
        responseBody = await response.text();
    }

    if (import.meta.env.DEV) {
        console.log("Ответ запроса GET ", responseBody);
    }

    if (!response.ok) {
        const errorMessage =
            responseBody && typeof responseBody === "object" && responseBody.error
                ? responseBody.error
                : response.statusText || "Unknown error";

        const error = new Error(errorMessage);
        error.status = response.status;
        error.body = responseBody;
        throw error;
    }

    return responseBody;
};