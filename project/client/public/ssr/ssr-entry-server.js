"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const nModules = require("./ssr-n-modules.js");
const reactRedux = require("react-redux");
const toolkit = require("@reduxjs/toolkit");
const React = require("react");
const require$$2 = require("react-router");
const fa = require("react-icons/fa");
const md = require("react-icons/md");
const ri = require("react-icons/ri");
const fa6 = require("react-icons/fa6");
const lu = require("react-icons/lu");
const rx = require("react-icons/rx");
const gi = require("react-icons/gi");
const bs = require("react-icons/bs");
const bi = require("react-icons/bi");
const io5 = require("react-icons/io5");
const reactHelmetAsync = require("react-helmet-async");
require("@remix-run/router");
require("react-dom");
const API_ROUTES = {
  user: {
    login: "/api/user/login",
    register: "/api/user/register",
    resendVerification: "/api/user/resend-verification",
    validToken: "/api/user/validate-tokens",
    logout: "/api/user/logout"
  },
  posts: {
    create: "/api/posts/create",
    update: "/api/posts/update",
    upload: "/api/posts/upload",
    delete: "/api/posts/delete",
    get: "/api/posts/get",
    userPosts: "/api/posts/user",
    favorites: "/api/posts/favorites",
    feed: "/api/posts/feed",
    search: "/api/posts/search"
  },
  favorites: {
    add: "/api/user/favorites",
    remove: "/api/user/favorites"
  }
};
const isServer$1 = typeof window === "undefined";
const API_BASE_URL$1 = isServer$1 ? process.env.API_BASE_URL || "http://localhost:3100" : "";
const PROXY_API_PATH$1 = "";
const postApi = async (uri, data2 = {}, options = {}) => {
  const {
    accept = "application/json",
    headers = {},
    contentType,
    method = "POST"
  } = options;
  const fetchHeaders = new Headers({
    Accept: accept,
    ...headers
  });
  let body;
  if (data2 instanceof FormData) {
    body = data2;
  } else if (data2 instanceof Blob || data2 instanceof File) {
    body = data2;
    if (contentType) {
      fetchHeaders.set("Content-Type", contentType);
    } else if (!fetchHeaders.has("Content-Type")) ;
  } else if (typeof data2 === "string") {
    body = data2;
    if (contentType) {
      fetchHeaders.set("Content-Type", contentType);
    } else if (!fetchHeaders.has("Content-Type")) {
      fetchHeaders.set("Content-Type", "text/plain;charset=UTF-8");
    }
  } else if (data2 && typeof data2 === "object") {
    body = JSON.stringify(data2);
    if (contentType) {
      fetchHeaders.set("Content-Type", contentType);
    } else if (!fetchHeaders.has("Content-Type")) {
      fetchHeaders.set("Content-Type", "application/json;charset=UTF-8");
    }
  } else {
    body = null;
  }
  const response = await fetch(`${API_BASE_URL$1}${PROXY_API_PATH$1}${uri}`, {
    method,
    headers: fetchHeaders,
    body
  });
  const contentTypeResponse = response.headers.get("Content-Type") || "";
  let responseBody;
  if (contentTypeResponse.includes("application/json")) {
    responseBody = await response.json();
  } else if (contentTypeResponse.startsWith("text/")) {
    responseBody = await response.text();
  } else if (contentTypeResponse.includes("application/octet-stream") || contentTypeResponse.includes("application/pdf") || contentTypeResponse.startsWith("image/") || contentTypeResponse.startsWith("audio/") || contentTypeResponse.startsWith("video/")) {
    responseBody = await response.blob();
  } else {
    responseBody = await response.text();
  }
  if (!response.ok || responseBody && responseBody.type === "error") {
    let errorMessage = response.statusText || "Неизвестная ошибка";
    if (responseBody && typeof responseBody === "object") {
      if (responseBody.message) {
        errorMessage = responseBody.message;
      }
      const error = new Error(errorMessage);
      error.status = response.status || responseBody.status || 500;
      for (const [key, value] of Object.entries(responseBody)) {
        if (key !== "message") {
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
const decodeJwt = (token) => {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payloadJson);
  } catch (e) {
    return null;
  }
};
const isTokenValid = (token, expireThreshold = 300) => {
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!(payload == null ? void 0 : payload.exp)) return false;
  const currentTime = Date.now() / 1e3;
  const expiresIn = payload.exp - currentTime;
  return expiresIn > expireThreshold;
};
const isEnglishText = (text) => {
  return /^[a-zA-Z0-9\s\.,!?;:'"@#$%^&*()_+\-=\[\]{}<>\\\/]+$/.test(text);
};
const addFavorite = toolkit.createAsyncThunk("favorites/addFavorite", async ({ userId, postId }, { getState, rejectWithValue }) => {
  var _a;
  try {
    const state = getState();
    const accessToken = ((_a = state.userData) == null ? void 0 : _a.accessToken) || "";
    const response = await postApi(
      `${API_ROUTES.favorites.add}/${postId}`,
      { userId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return response.data.userFavoritesIdList;
  } catch (error) {
    return rejectWithValue(error);
  }
});
const removeFavorite = toolkit.createAsyncThunk("favorites/removeFavorite", async ({ userId, postId }, { getState, rejectWithValue }) => {
  var _a;
  try {
    const state = getState();
    const accessToken = ((_a = state.userData) == null ? void 0 : _a.accessToken) || "";
    const response = await postApi(
      `${API_ROUTES.favorites.remove}/${postId}`,
      { userId },
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    return response.data.userFavoritesIdList;
  } catch (error) {
    return rejectWithValue(error);
  }
});
const setErrMsg$1 = (err) => {
  return err && !isEnglishText(err) ? err : "Ошибка сервера. Попробуйте позже.";
};
const regUser = toolkit.createAsyncThunk("userData/regUser", async (data2, thunkAPI) => {
  try {
    return await postApi(API_ROUTES.user.register, data2);
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка регистрации. Попробуйте позже.");
  }
});
const loginUser = toolkit.createAsyncThunk("userData/loginUser", async (data2, thunkAPI) => {
  try {
    return await postApi(API_ROUTES.user.login, data2);
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка авторизации. Попробуйте позже.");
  }
});
const resendVerification = toolkit.createAsyncThunk("userData/resendVerification", async (data2, thunkAPI) => {
  var _a;
  try {
    const state = thunkAPI.getState();
    const tempAuthToken = ((_a = state.userData) == null ? void 0 : _a.tempAuthToken) || localStorage.getItem("tempAuthToken");
    if (!tempAuthToken) {
      return thunkAPI.rejectWithValue("Ошибка отправки письма активации. Авторизуйтесь снова.");
    }
    return await postApi(API_ROUTES.user.resendVerification, { tempAuthToken });
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Время сессии истекло. Авторизуйтесь снова.");
  }
});
const checkToken = toolkit.createAsyncThunk("userData/checkToken", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const accessToken = state.userData.accessToken;
    if (accessToken && isTokenValid(accessToken)) {
      return { accessToken };
    }
    return await thunkAPI.dispatch(refreshToken()).unwrap();
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка авторизации. Авторизуйтесь снова.");
  }
});
const refreshToken = toolkit.createAsyncThunk("userData/refreshToken", async (data2, thunkAPI) => {
  var _a, _b;
  try {
    const state = thunkAPI.getState();
    const accessToken = ((_a = state.userData) == null ? void 0 : _a.accessToken) || "";
    return await postApi(
      API_ROUTES.user.validToken,
      {},
      {
        // Для SSR передаем куки из запроса
        headers: {
          Cookie: typeof window === "undefined" ? ((_b = thunkAPI.extra) == null ? void 0 : _b.req.headers.cookie) || "" : "",
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Время сессии истекло. Авторизуйтесь снова.");
  }
});
const logoutUser = toolkit.createAsyncThunk("userData/logoutUser", async (_, thunkAPI) => {
  var _a;
  try {
    const state = thunkAPI.getState();
    const accessToken = ((_a = state.userData) == null ? void 0 : _a.accessToken) || "";
    return await postApi(
      API_ROUTES.user.logout,
      { accessToken },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка выхода из аккаунта. Попробуйте позже.");
  }
});
const initialState$2 = {
  user: "",
  // имя пользователя
  userFavorites: [],
  // избранные посты пользователя
  isAuth: false,
  // если пользователь успешно авторизован и активирован
  isAdmin: false,
  authCheckStatus: "idle",
  // состояние автоматической авторизации 'idle' | 'pending' | 'succeeded' | 'failed' | 'logout'
  errAuth: null,
  // ошибки авторизации
  errFav: null,
  // ошибки списка избранных
  favStatus: "idle",
  // состояние запроса списка избранных: 'idle' | 'loading' | 'succeeded' | 'error'
  registerStatus: "idle",
  // состояние запроса regUser: 'idle' | 'pending' | 'registered' | 'error'
  resendActStatus: "idle",
  // состояние запроса resendVerification: 'idle' | 'pending' | 'shipped' | 'error'
  loginStatus: "idle",
  // состояние запроса loginUser: 'idle' | 'pending' | 'authenticated' | 'unactivated' | 'error' | 'logout'
  tempAuthToken: null,
  // временный токен для отправки активации
  accessToken: null
  // токен доступа - даётся в статусе authenticated
};
const userDataSlice = toolkit.createSlice({
  name: "userData",
  initialState: initialState$2,
  reducers: {
    clearError: (state, action) => {
      if (action.payload) state.errAuth = initialState$2.errAuth;
    },
    setAuthToken: (state, action) => {
      if (action.payload !== state.tempAuthToken && typeof action.payload === "string") {
        state.tempAuthToken = action.payload;
      }
    },
    updateUserFavorites: (state, action) => {
      const postId = action.payload;
      const index = state.userFavorites.indexOf(postId);
      if (index === -1) {
        state.userFavorites.push(postId);
      } else {
        state.userFavorites.splice(index, 1);
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(regUser.pending, (state) => {
      state.registerStatus = "pending";
      state.resendActStatus = initialState$2.resendActStatus;
      state.loginStatus = initialState$2.loginStatus;
      state.errAuth = null;
    }).addCase(regUser.fulfilled, (state, action) => {
      var _a, _b, _c;
      if (action.payload.success) {
        state.registerStatus = "registered";
        if (typeof ((_a = action.payload.data) == null ? void 0 : _a.tempAuthToken) === "string") {
          state.tempAuthToken = (_b = action.payload.data) == null ? void 0 : _b.tempAuthToken;
          localStorage.setItem("tempAuthToken", (_c = action.payload.data) == null ? void 0 : _c.tempAuthToken);
        }
      }
    }).addCase(regUser.rejected, (state, action) => {
      var _a, _b;
      state.registerStatus = "error";
      const bodyError = ((_a = action.payload.data) == null ? void 0 : _a.errors) || ((_b = action.payload) == null ? void 0 : _b.message);
      state.errAuth = setErrMsg$1(bodyError);
    }).addCase(loginUser.pending, (state) => {
      state.loginStatus = "pending";
      state.resendActStatus = initialState$2.resendActStatus;
      state.registerStatus = initialState$2.registerStatus;
      state.errAuth = null;
    }).addCase(loginUser.fulfilled, (state, action) => {
      var _a, _b, _c, _d;
      if (action.payload.success) {
        state.loginStatus = "authenticated";
        state.isAuth = true;
        state.isAdmin = (_a = action.payload.data) == null ? void 0 : _a.isAdmin;
        state.userFavorites = ((_b = action.payload.data) == null ? void 0 : _b.userFavoritesIdList) || [];
        state.authCheckStatus = "succeeded";
        state.tempAuthToken = initialState$2.tempAuthToken;
        localStorage.removeItem("tempAuthToken");
        state.user = ((_c = action.payload.data) == null ? void 0 : _c.username) || "";
        state.accessToken = (_d = action.payload.data) == null ? void 0 : _d.accessToken;
      }
    }).addCase(loginUser.rejected, (state, action) => {
      var _a, _b, _c, _d, _e, _f;
      if (((_a = action.payload) == null ? void 0 : _a.code) === "ACCOUNT_NOT_ACTIVATED") {
        state.loginStatus = "unactivated";
        if (typeof ((_b = action.payload.data) == null ? void 0 : _b.tempAuthToken) === "string") {
          state.tempAuthToken = (_c = action.payload.data) == null ? void 0 : _c.tempAuthToken;
          localStorage.setItem("tempAuthToken", (_d = action.payload.data) == null ? void 0 : _d.tempAuthToken);
        }
      } else {
        state.authCheckStatus = "failed";
        state.loginStatus = "error";
        const bodyError = ((_e = action.payload.data) == null ? void 0 : _e.errors) || ((_f = action.payload) == null ? void 0 : _f.message);
        state.errAuth = setErrMsg$1(bodyError);
      }
    }).addCase(resendVerification.pending, (state) => {
      state.resendActStatus = "pending";
      state.errAuth = null;
    }).addCase(resendVerification.fulfilled, (state, action) => {
      if (action.payload.success) {
        state.resendActStatus = "shipped";
      }
    }).addCase(resendVerification.rejected, (state, action) => {
      var _a, _b;
      state.resendActStatus = "error";
      const bodyError = ((_a = action.payload.data) == null ? void 0 : _a.errors) || ((_b = action.payload) == null ? void 0 : _b.message);
      state.errAuth = setErrMsg$1(bodyError);
    }).addCase(checkToken.fulfilled, (state) => {
      state.isAuth = true;
      state.authCheckStatus = "succeeded";
    }).addCase(checkToken.rejected, (state) => {
      state.accessToken = null;
      state.isAuth = false;
      state.authCheckStatus = "failed";
    }).addCase(refreshToken.pending, (state) => {
      state.errAuth = null;
      state.authCheckStatus = "pending";
    }).addCase(refreshToken.fulfilled, (state, action) => {
      var _a, _b, _c, _d, _e, _f;
      if (action.payload.success) {
        state.loginStatus = "authenticated";
        state.authCheckStatus = "succeeded";
        state.isAuth = true;
        state.isAdmin = (_a = action.payload.data) == null ? void 0 : _a.isAdmin;
        state.userFavorites = ((_b = action.payload.data) == null ? void 0 : _b.userFavoritesIdList) || [];
        state.user = ((_c = action.payload.data) == null ? void 0 : _c.username) || "";
        if (typeof ((_d = action.payload.data) == null ? void 0 : _d.accessToken) === "string" && ((_e = action.payload.data) == null ? void 0 : _e.isNewToken)) {
          state.accessToken = (_f = action.payload.data) == null ? void 0 : _f.accessToken;
        }
      }
    }).addCase(refreshToken.rejected, (state) => {
      state.loginStatus = "error";
      state.authCheckStatus = "failed";
      state.isAuth = false;
      state.isAdmin = false;
      state.accessToken = null;
    }).addCase(logoutUser.fulfilled, (state) => {
      Object.assign(state, initialState$2);
      state.loginStatus = "logout";
      state.authCheckStatus = "logout";
    }).addCase(logoutUser.rejected, (state, action) => {
      var _a, _b;
      const bodyError = ((_a = action.payload.data) == null ? void 0 : _a.errors) || ((_b = action.payload) == null ? void 0 : _b.message);
      state.errAuth = setErrMsg$1(bodyError);
    }).addCase(addFavorite.pending, (state) => {
      state.favStatus = "loading";
    }).addCase(addFavorite.fulfilled, (state, action) => {
      state.favStatus = "succeeded";
      state.userFavorites = action.payload;
    }).addCase(addFavorite.rejected, (state, action) => {
      var _a, _b;
      state.favStatus = "error";
      const bodyError = ((_a = action.payload.data) == null ? void 0 : _a.errors) || ((_b = action.payload) == null ? void 0 : _b.message);
      state.errFav = setErrMsg$1(bodyError);
    }).addCase(removeFavorite.pending, (state) => {
      state.favStatus = "loading";
    }).addCase(removeFavorite.fulfilled, (state, action) => {
      state.favStatus = "succeeded";
      state.userFavorites = action.payload;
    }).addCase(removeFavorite.rejected, (state, action) => {
      var _a, _b;
      state.favStatus = "error";
      const bodyError = ((_a = action.payload.data) == null ? void 0 : _a.errors) || ((_b = action.payload) == null ? void 0 : _b.message);
      state.errFav = setErrMsg$1(bodyError);
    });
  }
});
const { clearError, setAuthToken, updateUserFavorites } = userDataSlice.actions;
const userDataSlice$1 = userDataSlice.reducer;
const initialState$1 = {
  hasUnsavedChanges: false,
  pendingNavigation: null
};
const appSettingsSlice = toolkit.createSlice({
  name: "appSettings",
  initialState: initialState$1,
  reducers: {
    setUnsavedChanges: (state, action) => {
      state.hasUnsavedChanges = action.payload;
    },
    setPendingNavigation: (state, action) => {
      state.pendingNavigation = action.payload;
    },
    clearPendingNavigation: (state) => {
      state.pendingNavigation = null;
    }
  }
});
const { setUnsavedChanges, setPendingNavigation, clearPendingNavigation } = appSettingsSlice.actions;
const appSettingsSlice$1 = appSettingsSlice.reducer;
const deepMerge = (target, source) => {
  if (typeof target !== "object" || typeof source !== "object") {
    return source || target;
  }
  const result = { ...target };
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === "object" && !Array.isArray(source[key]) && typeof target[key] === "object" && !Array.isArray(target[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
};
const DB_NAME = "PostImagesDB";
const STORE_NAME = "images";
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
const saveToIndexedDB = async (key, file) => {
  const db = await initDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.put({ key, file });
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};
const getFromIndexedDB = async (key) => {
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
const clearTempImages = async () => {
  const db = await initDB();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
};
const getFileExtension = (mimeType) => {
  const extensions = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg"
  };
  return extensions[mimeType] || "bin";
};
const isServer = typeof window === "undefined";
const API_BASE_URL = isServer ? process.env.API_BASE_URL || "http://localhost:3060" : "";
const PROXY_API_PATH = "";
const getApi = async (uri, params = {}, options = {}) => {
  const { accept = "application/json", headers = {} } = options;
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${PROXY_API_PATH}${uri}${queryString ? `?${queryString}` : ""}`;
  const fetchHeaders = new Headers({
    Accept: accept,
    ...headers
  });
  const response = await fetch(url, {
    method: "GET",
    headers: fetchHeaders
  });
  const contentType = response.headers.get("Content-Type") || "";
  let responseBody;
  if (contentType.includes("application/json")) {
    responseBody = await response.json();
  } else if (contentType.startsWith("text/")) {
    responseBody = await response.text();
  } else if (contentType.includes("application/octet-stream") || contentType.includes("application/pdf") || contentType.startsWith("image/") || contentType.startsWith("audio/") || contentType.startsWith("video/")) {
    responseBody = await response.blob();
  } else {
    responseBody = await response.text();
  }
  if (!response.ok) {
    const errorMessage = responseBody && typeof responseBody === "object" && responseBody.error ? responseBody.error : response.statusText || "Unknown error";
    const error = new Error(errorMessage);
    error.status = response.status;
    error.body = responseBody;
    throw error;
  }
  return responseBody;
};
const setErrMsg = (err) => {
  return err && !isEnglishText(err) ? err : "Ошибка сервера. Попробуйте снова.";
};
const fetchPost = toolkit.createAsyncThunk("post/fetchPost", async (postId, { rejectWithValue }) => {
  try {
    return await getApi(`${API_ROUTES.posts.get}/${postId}`);
  } catch (error) {
    return rejectWithValue(error);
  }
});
const fetchUserPosts = toolkit.createAsyncThunk("postsData/fetchUserPosts", async (_, { getState, rejectWithValue }) => {
  var _a;
  const state = getState();
  const accessToken = ((_a = state.userData) == null ? void 0 : _a.accessToken) || "";
  const postOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };
  try {
    return await getApi(`${API_ROUTES.posts.userPosts}`, {}, postOptions);
  } catch (error) {
    return rejectWithValue(error);
  }
});
const fetchFavoritePosts = toolkit.createAsyncThunk("postsData/fetchFavoritePosts", async (_, { getState, rejectWithValue }) => {
  var _a;
  const state = getState();
  const accessToken = ((_a = state.userData) == null ? void 0 : _a.accessToken) || "";
  const postOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };
  try {
    return await getApi(`${API_ROUTES.posts.favorites}`, {}, postOptions);
  } catch (error) {
    return rejectWithValue(error);
  }
});
const fetchFeedPosts = toolkit.createAsyncThunk("postsData/fetchFeedPosts", async ({ page = 1 } = {}, { rejectWithValue }) => {
  try {
    const response = await getApi(`${API_ROUTES.posts.feed}?page=${page}&limit=10`);
    return {
      posts: response.data.posts,
      page,
      total: response.data.total,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    return rejectWithValue(error);
  }
});
const savePost = toolkit.createAsyncThunk("postsData/savePost", async ({ isNew }, { getState, rejectWithValue }) => {
  var _a;
  try {
    const state = getState();
    const { postData, images } = state.postsData;
    const accessToken = ((_a = state.userData) == null ? void 0 : _a.accessToken) || "";
    const postOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    };
    let postId;
    console.log();
    if (isNew) {
      const savedPost = await postApi(API_ROUTES.posts.create, postData, postOptions);
      postId = savedPost.data.postId;
    } else {
      await postApi(`${API_ROUTES.posts.update}/${postData.meta.id}`, postData, postOptions);
      postId = postData.meta.id;
    }
    const updatedBlocks = [...postData.content];
    const uploadPromises = [];
    for (const [blockId, imageInfo] of Object.entries(images)) {
      const blockIndex = updatedBlocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) continue;
      const block = updatedBlocks[blockIndex];
      if (block.type !== "image") continue;
      const file = await getFromIndexedDB(imageInfo.key);
      const fileExtension = getFileExtension(block.data.fileType);
      const serverFileName = `${block.data.fileName}.${fileExtension}`;
      const headers = {
        ...postOptions.headers,
        "x-post-id": postId,
        "x-file-name": encodeURIComponent(serverFileName),
        "x-block-id": encodeURIComponent(blockId)
      };
      uploadPromises.push(
        // с await - последовательно загружаем, без - лимит параллельной загрузки
        await postApi(`${API_ROUTES.posts.upload}/${postId}`, file, { headers })
      );
    }
    await Promise.all(uploadPromises);
    await clearTempImages();
    return true;
  } catch (error) {
    return rejectWithValue(error);
  }
});
const deletePost = toolkit.createAsyncThunk("postsData/deletePost", async (postId, { getState, rejectWithValue }) => {
  var _a;
  try {
    const state = getState();
    const accessToken = ((_a = state.userData) == null ? void 0 : _a.accessToken) || "";
    await postApi(`${API_ROUTES.posts.delete}/${postId}`, null, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return postId;
  } catch (error) {
    return rejectWithValue(error);
  }
});
const postsDataSlice = toolkit.createSlice({
  name: "postsData",
  initialState: {
    userPosts: [],
    favoritePosts: [],
    postData: {},
    statusFavList: "idle",
    // idle, loading, succeeded, error
    statusFav: "idle",
    // idle, loading, succeeded, error
    statusDelete: "idle",
    // idle, loading, succeeded, error
    statusGet: "idle",
    // idle, loading, succeeded, error
    statusSend: "idle",
    // idle, loading, succeeded, error
    error: false,
    // {status, message}
    errorFavList: false,
    // {status, message}
    images: {},
    feedPosts: [],
    feedPage: 1,
    feedTotal: 0,
    feedTotalPages: 1,
    feedStatus: "idle",
    // 'idle' | 'loading' | 'loading-more' | 'succeeded' | 'failed'
    errorFeed: false
    // {status, message}
  },
  reducers: {
    setPostData: (state, action) => {
      state.postData = action.payload;
    },
    mergePostData: (state, action) => {
      state.postData = deepMerge(state.postData, action.payload);
    },
    updatePostData: (state, action) => {
      if (state.postData) {
        state.postData = { meta: { ...state.postData.meta, ...action.payload.meta }, content: action.payload.content };
      } else {
        state.postData = action.payload;
      }
    },
    addImage: (state, action) => {
      const { blockId, key, file, fileName } = action.payload;
      state.images[blockId] = { key, file, fileName };
    },
    clearPostState: (state) => {
      state.postData = {};
      state.statusSend = "idle";
      state.error = null;
      state.images = {};
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPost.pending, (state) => {
      state.statusGet = "loading";
    }).addCase(fetchPost.fulfilled, (state, action) => {
      state.statusGet = "succeeded";
      state.postData = action.payload.data;
    }).addCase(fetchPost.rejected, (state, action) => {
      var _a;
      state.statusGet = "error";
      const bodyError = (_a = action.payload) == null ? void 0 : _a.message;
      state.error = bodyError || "Ошибка загрузки поста";
    }).addCase(savePost.pending, (state) => {
      state.statusSend = "loading";
    }).addCase(savePost.fulfilled, (state, action) => {
      state.statusSend = "succeeded";
      state.data = action.payload;
      state.images = {};
      if (action.payload.isNew) {
        state.postData.meta.id = action.payload.postId;
      }
    }).addCase(savePost.rejected, (state, action) => {
      var _a;
      state.statusSend = "error";
      const bodyError = (_a = action.payload) == null ? void 0 : _a.message;
      state.error = setErrMsg(bodyError);
    }).addCase(deletePost.pending, (state) => {
      state.statusDelete = "loading";
    }).addCase(deletePost.fulfilled, (state) => {
      state.statusDelete = "succeeded";
      state.postData = {};
    }).addCase(deletePost.rejected, (state, action) => {
      var _a;
      state.statusDelete = "error";
      const bodyError = (_a = action.payload) == null ? void 0 : _a.message;
      state.error = setErrMsg(bodyError);
    }).addCase(fetchUserPosts.pending, (state) => {
      state.statusFavList = "loading";
    }).addCase(fetchUserPosts.fulfilled, (state, action) => {
      state.statusFavList = "succeeded";
      state.userPosts = action.payload.data;
    }).addCase(fetchUserPosts.rejected, (state, action) => {
      var _a;
      state.statusFavList = "error";
      const bodyError = (_a = action.payload) == null ? void 0 : _a.message;
      state.errorFavList = setErrMsg(bodyError);
    }).addCase(fetchFavoritePosts.pending, (state) => {
      state.statusFavList = "loading";
    }).addCase(fetchFavoritePosts.fulfilled, (state, action) => {
      state.statusFavList = "succeeded";
      state.favoritePosts = action.payload.data;
    }).addCase(fetchFavoritePosts.rejected, (state, action) => {
      var _a;
      state.statusFavList = "error";
      const bodyError = (_a = action.payload) == null ? void 0 : _a.message;
      state.errorFavList = setErrMsg(bodyError);
    }).addCase(fetchFeedPosts.pending, (state, action) => {
      if (action.meta.arg.page === 1) {
        state.feedStatus = "loading";
      } else {
        state.feedStatus = "loading-more";
      }
    }).addCase(fetchFeedPosts.fulfilled, (state, action) => {
      state.feedStatus = "succeeded";
      if (action.payload.page === 1) {
        state.feedPosts = action.payload.posts;
      } else {
        state.feedPosts = [...state.feedPosts, ...action.payload.posts];
      }
      state.feedPage = action.payload.page;
      state.feedTotal = action.payload.total;
      state.feedTotalPages = action.payload.totalPages;
    }).addCase(fetchFeedPosts.rejected, (state, action) => {
      var _a;
      state.feedStatus = "failed";
      state.errorFeed = (_a = action.payload) == null ? void 0 : _a.message;
    });
  }
});
const { setPostData, updatePostData, addImage, clearPostState, mergePostData } = postsDataSlice.actions;
const postsDataSlice$1 = postsDataSlice.reducer;
function createStore(preloadedState = {}, serverReq = null) {
  return toolkit.configureStore({
    reducer: {
      userData: userDataSlice$1,
      appSettings: appSettingsSlice$1,
      postsData: postsDataSlice$1
    },
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false,
      thunk: {
        extraArgument: { req: serverReq }
      }
    })
  });
}
function SafeNavigate({ to }) {
  const context = useSSRContext();
  if (typeof window === "undefined") {
    context.url = to;
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(require$$2.Navigate, { to, replace: true });
}
const LoadingSpinner = () => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "loading-spinner", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "spinner" }) });
const ProtectedRoute = ({ children }) => {
  const dispatch = reactRedux.useDispatch();
  const { isAuth, accessToken, authCheckStatus } = reactRedux.useSelector((state) => state.userData);
  React.useEffect(() => {
    if (accessToken) {
      dispatch(checkToken());
    }
  }, [dispatch, accessToken]);
  if (authCheckStatus === "idle" || authCheckStatus === "pending") {
    return /* @__PURE__ */ jsxRuntime.jsx(LoadingSpinner, { fullScreen: true });
  }
  if (authCheckStatus === "failed" || !isAuth) {
    return /* @__PURE__ */ jsxRuntime.jsx(SafeNavigate, { to: "/auth/sign-in", replace: true });
  }
  return children;
};
const initialState = {
  username: "",
  email: "",
  password: "",
  login: ""
};
function generateErrList(err) {
  if (typeof err === "string") {
    return /* @__PURE__ */ jsxRuntime.jsx("li", { className: "auth__error", children: err }, err);
  }
  if (React.isValidElement(err)) {
    return /* @__PURE__ */ jsxRuntime.jsx("li", { className: "auth__error", children: err });
  }
  if (Array.isArray(err)) {
    return err.map((msg) => generateErrList(msg));
  }
  if (err && typeof err === "object") {
    return Object.entries(err).flatMap(
      ([_, value]) => generateErrList(value)
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx("li", { className: "auth__error", children: String(err) });
}
function AuthForm({ mode = "login", onSubmit, externalError, validator }) {
  const [form, setForm] = React.useState(initialState);
  const [errors, setErrors] = React.useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validator(
      mode,
      {
        username: form.username,
        email: form.email,
        password: form.password,
        login: form.login
      }
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    if (mode === "register") {
      onSubmit({
        username: form.username,
        email: form.email,
        password: form.password
      });
    } else {
      onSubmit({
        login: form.login,
        password: form.password
      });
    }
  };
  React.useEffect(() => {
    setForm(initialState);
    setErrors({});
  }, [mode]);
  return /* @__PURE__ */ jsxRuntime.jsxs("form", { onSubmit: handleSubmit, className: "auth__form", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "auth__title", children: mode === "register" ? "Регистрация" : "Авторизация" }),
    mode === "register" ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "auth__field-box", children: [
      /* @__PURE__ */ jsxRuntime.jsx("label", { htmlFor: "username", children: "Ник пользователя" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "text",
          id: "username",
          name: "username",
          value: form.username,
          onChange: handleChange,
          className: "auth__input",
          autoComplete: "username"
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "auth__field-box", children: [
      /* @__PURE__ */ jsxRuntime.jsx("label", { htmlFor: "login", children: "Email" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "text",
          id: "login",
          name: "login",
          value: form.login,
          onChange: handleChange,
          className: "auth__input",
          autoComplete: "username"
        }
      )
    ] }),
    mode === "register" && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "auth__field-box", children: [
      /* @__PURE__ */ jsxRuntime.jsx("label", { htmlFor: "email", children: "Email" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "email",
          id: "email",
          name: "email",
          value: form.email,
          onChange: handleChange,
          className: "auth__input",
          autoComplete: "email"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "auth__field-box", children: [
      /* @__PURE__ */ jsxRuntime.jsx("label", { htmlFor: "password", children: "Пароль" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "password",
          id: "password",
          name: "password",
          value: form.password,
          onChange: handleChange,
          className: "auth__input",
          autoComplete: "current-password"
        }
      )
    ] }),
    (Object.keys(errors).length > 0 || externalError) && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "auth__divider" }),
      /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "auth__errors", children: [
        Object.keys(errors).length > 0 && generateErrList(errors),
        externalError && generateErrList(externalError)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("button", { type: "submit", className: "auth__button", children: mode === "register" ? "Зарегистрироваться" : "Войти" })
  ] });
}
const AuthForm$1 = React.memo(AuthForm);
function UnverifiedNotice({ onResend, isLoading, isSend, hasToken, error }) {
  const [cooldown, setCooldown] = React.useState(0);
  React.useEffect(() => {
    if (isSend) {
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
      return () => clearInterval(timer);
    }
  }, [isSend]);
  const getButtonState = () => {
    if (!hasToken) {
      return {
        disabled: true,
        text: "Требуется авторизация",
        hint: "Время сессии истекло. Авторизуйтесь снова."
      };
    }
    if (isLoading) {
      return {
        disabled: true,
        text: "Отправка..."
      };
    }
    if (cooldown > 0) {
      return {
        disabled: true,
        text: `Повтор через ${cooldown} сек`
      };
    }
    if (error) {
      return {
        disabled: false,
        text: "Повторить отправку",
        hint: error
      };
    }
    return {
      disabled: false,
      text: "Отправить письмо повторно"
    };
  };
  const buttonState = getButtonState();
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "auth__unverified", children: [
    /* @__PURE__ */ jsxRuntime.jsx("p", { children: "Аккаунт не активирован. Проверьте почту и подтвердите регистрацию." }),
    buttonState.hint && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "auth__error-resend", children: buttonState.hint }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        type: "button",
        onClick: onResend,
        disabled: buttonState.disabled,
        className: "auth__resend-button",
        children: buttonState.text
      }
    )
  ] });
}
function validate(mode, { username, email, password, login }) {
  const errs = {};
  const usernameRegex = /^[A-Za-z0-9]{1,20}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  const ERROR_MESSAGES = {
    username: {
      required: "Введите логин",
      invalid: "Логин может содержать только английские буквы и цифры, максимум 20 символов"
    },
    email: {
      required: "Введите email",
      invalid: "Некорректный email"
    },
    login: {
      required: "Введите email",
      //invalidChars: "Логин может содержать только латинские буквы и цифры",
      invalidEmail: "Некорректный email",
      tooLong: "Максимум 50 символов"
    },
    password: {
      required: "Введите пароль",
      invalid: "Пароль должен содержать минимум 8 символов, включая заглавную букву, цифру и спецсимвол"
    }
  };
  if (mode === "register") {
    if (!username.trim()) {
      errs.username = ERROR_MESSAGES.username.required;
    } else if (!usernameRegex.test(username)) {
      errs.username = ERROR_MESSAGES.username.invalid;
    }
    if (!email.trim()) {
      errs.email = ERROR_MESSAGES.email.required;
    } else if (!emailRegex.test(email)) {
      errs.email = ERROR_MESSAGES.email.invalid;
    }
  } else {
    if (!login.trim()) {
      errs.identifier = ERROR_MESSAGES.login.required;
    } else if (login.length > 50) {
      errs.identifier = ERROR_MESSAGES.login.tooLong;
    } else if (!emailRegex.test(login)) {
      errs.identifier = ERROR_MESSAGES.login.invalidEmail;
    }
  }
  if (!password.trim()) {
    errs.password = ERROR_MESSAGES.password.required;
  } else if (mode === "register" && !passwordRegex.test(password)) {
    errs.password = ERROR_MESSAGES.password.invalid;
  }
  return errs;
}
function usePageTitle(title) {
  const location = require$$2.useLocation();
  React.useEffect(() => {
    document.title = title;
  }, [location, title]);
}
const pageTitles = {
  login: "Вход в систему",
  register: "Регистрация",
  verified: "Подтверждение email"
};
function AuthPage({ mode }) {
  const navigate = require$$2.useNavigate();
  const dispatch = reactRedux.useDispatch();
  const { tempAuthToken, errAuth, isAuth, registerStatus, loginStatus, resendActStatus } = reactRedux.useSelector((state) => state.userData);
  usePageTitle(`${pageTitles[mode]} | ${"Messaria"}`);
  React.useEffect(() => {
    if (isAuth) {
      navigate("/feed");
    } else if (loginStatus === "unactivated") {
      navigate("/auth/verified");
    }
  }, [isAuth, loginStatus]);
  React.useEffect(() => {
    if (registerStatus === "registered") {
      navigate("/auth/verified");
    }
  }, [registerStatus]);
  const handleSubmit = async (data2) => {
    const action = mode === "register" ? regUser(data2) : loginUser(data2);
    await dispatch(action);
  };
  const handleResend = async () => {
    await dispatch(resendVerification());
  };
  const handleSwitchMode = () => {
    dispatch(clearError(true));
    let to;
    switch (mode) {
      case "register":
        to = "/auth/sign-in";
        break;
      case "login":
        to = "/auth/sign-up";
        break;
      case "verified":
        to = "/auth/sign-in";
        break;
      default:
        to = "/auth/sign-in";
    }
    navigate(to);
  };
  React.useEffect(() => {
    const token = localStorage.getItem("tempAuthToken");
    if (token) dispatch(setAuthToken(token));
    if (mode === "verified" && !token) navigate("/auth/sign-in");
  }, [mode, dispatch, navigate]);
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: /* @__PURE__ */ jsxRuntime.jsxs("main", { className: "auth__container", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "visually-hidden", children: document.title }),
    (mode === "register" || mode === "login") && /* @__PURE__ */ jsxRuntime.jsx("section", { children: /* @__PURE__ */ jsxRuntime.jsx(
      AuthForm$1,
      {
        mode,
        onSubmit: handleSubmit,
        validator: validate,
        externalError: errAuth ? errAuth : ""
      }
    ) }),
    mode === "verified" && /* @__PURE__ */ jsxRuntime.jsx("section", { children: /* @__PURE__ */ jsxRuntime.jsx(
      UnverifiedNotice,
      {
        onResend: handleResend,
        isLoading: resendActStatus === "pending",
        isSend: resendActStatus === "shipped",
        hasToken: !!tempAuthToken,
        error: errAuth
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        className: "auth__button",
        onClick: () => handleSwitchMode(),
        "aria-label": mode === "register" ? "Перейти к странице входа" : mode === "login" ? "Перейти к странице регистрации" : "Перейти к странице авторизации",
        children: [
          mode === "register" && "Уже есть аккаунт? Войти",
          mode === "login" && "Нет аккаунта? Зарегистрироваться",
          mode === "verified" && "Подтвердил почту? Авторизация"
        ]
      }
    )
  ] }) });
}
const PageAuth = React.memo(AuthPage);
const icon = {
  // Лого
  logo: /* @__PURE__ */ jsxRuntime.jsx("svg", { fill: "#000000", width: "58px", height: "58px", viewBox: "0 0 14 14", role: "img", focusable: "false", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M 7,1 C 3.6825,1 1,3.6865 1,7.0075 1,7.675 1.114,8.311 1.309,8.9125 l 1.7885,0 0,-5.048 L 7,7.7725 10.9025,3.865 l 0,5.0475 1.7885,0 C 12.8855,8.311 13,7.675 13,7.0075 13,3.6875 10.3175,1 7,1 Z M 6.106,8.6535 4.3975,6.943 l 0,3.1755 -2.5185,0 C 2.935,11.8445 4.839,13 7,13 c 2.161,0 4.081,-1.1555 5.1225,-2.882 l -2.52,0 0,-3.1755 -1.693,1.7105 -0.894,0.895 -0.907,-0.895 -0.0025,0 z" }) }),
  // Дом
  home: /* @__PURE__ */ jsxRuntime.jsx("svg", { x: "0px", y: "0px", width: "70.001px", height: "70.002px", viewBox: "0 0 70.001 70.002", children: /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M52.001,69.438h-34c-7.57,0-9.619-2.521-9.619-10.375V23.438c0-1.104,0.896-2,2-2s2,0.896,2,2v35.625c0,5.721,0.235,6.375,5.619,6.375h34c5.383,0,6.381-0.654,6.381-6.375V23.438c0-1.104,0.896-2,2-2c1.104,0,2,0.896,2,2v35.625C62.382,66.918,59.571,69.438,52.001,69.438z" }) }),
    /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M43.382,68.438c-0.553,0-1-0.446-1-1V48.464c0-1.987-0.381-2.025-2.581-2.025h-9.599c-2.2,0-1.819,0.038-1.819,2.025v18.975c0,0.554-0.448,1-1,1c-0.553,0-1-0.446-1-1V48.464c0-3.444,0.915-4.025,3.819-4.025h9.599c2.904,0,4.581,0.581,4.581,4.025v18.975C44.382,67.992,43.934,68.438,43.382,68.438z" }) }),
    /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M2.002,29.396c-0.606,0-1.206-0.275-1.6-0.797c-0.664-0.883-0.486-2.137,0.396-2.801l33-24.833c0.883-0.664,2.137-0.487,2.801,0.396c0.664,0.883,0.487,2.137-0.396,2.801l-33,24.833C2.843,29.266,2.421,29.396,2.002,29.396z" }) }),
    /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M68,29.396c-0.419,0-0.841-0.131-1.201-0.402l-33-24.833c-0.881-0.664-1.059-1.918-0.396-2.801c0.665-0.883,1.919-1.058,2.802-0.396l33,24.833c0.883,0.664,1.06,1.918,0.396,2.801C69.207,29.123,68.606,29.396,68,29.396z" }) }),
    /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M17.382,38.438c-0.553,0-1-0.446-1-1V26.063c0-0.311-0.046-0.604,0.201-0.793l13.03-10.063c0.438-0.336,1.019-0.253,1.354,0.185c0.336,0.438,0.421,1.066-0.018,1.402l-12.567,9.762v10.882C18.382,37.992,17.934,38.438,17.382,38.438z" }) }),
    /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M17.382,43.438c-0.553,0-1-0.446-1-1v-1c0-0.553,0.447-1,1-1c0.552,0,1,0.447,1,1v1C18.382,42.992,17.934,43.438,17.382,43.438z" }) })
  ] }) }) }),
  // Лупа
  lens: /* @__PURE__ */ jsxRuntime.jsx("svg", { x: "0px", y: "0px", width: "64.738px", height: "64.738px", viewBox: "0 0 64.738 64.738", children: /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M24.5,49.333C10.991,49.333,0,38.344,0,24.834s10.991-24.5,24.5-24.5c13.51,0,24.5,10.99,24.5,24.5C49.001,38.344,38.012,49.333,24.5,49.333z M24.5,4.334C13.196,4.334,4,13.53,4,24.834c0,11.305,9.196,20.499,20.5,20.499c11.303,0,20.5-9.194,20.5-20.499C45,13.53,35.805,4.334,24.5,4.334z" }) }),
    /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M10.017,17.25c-0.174,0-0.35-0.045-0.51-0.141c-0.475-0.281-0.631-0.896-0.349-1.37c3.201-5.39,9.08-8.738,15.342-8.738c0.553,0,1,0.447,1,1c0,0.553-0.447,1-1,1c-5.56,0-10.779,2.974-13.622,7.76C10.691,17.076,10.359,17.25,10.017,17.25z" }) }),
    /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M7.667,25.248c-0.552,0-1-0.447-1-1c0-1.42,0.169-2.211,0.468-3.487c0.126-0.538,0.664-0.87,1.201-0.746c0.538,0.126,0.872,0.663,0.746,1.201c-0.28,1.198-0.415,1.827-0.415,3.032C8.667,24.801,8.22,25.248,7.667,25.248z" }) }),
    /* @__PURE__ */ jsxRuntime.jsx("g", { children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M58.739,64.404c-1.604,0-3.108-0.623-4.244-1.756L38.354,46.505c-1.252-1.252-1.664-2.799-1.161-4.356c0.409-1.269,1.37-2.338,2.161-3.127c1.173-1.172,2.613-2.371,4.423-2.371c0.771,0,1.93,0.238,3.063,1.371l16.143,16.141c1.133,1.135,1.756,2.641,1.756,4.244c0,1.602-0.623,3.109-1.756,4.242C61.848,63.781,60.342,64.404,58.739,64.404zM40.982,43.445c0.007,0,0.06,0.094,0.199,0.232L57.323,59.82c0.756,0.754,2.073,0.754,2.83,0c0.377-0.379,0.584-0.881,0.584-1.414c0-0.535-0.207-1.037-0.586-1.416L44.012,40.85c-0.144-0.144-0.236-0.195-0.263-0.203c-0.014,0.008-0.426,0.061-1.565,1.203C41.04,42.99,40.985,43.402,40.982,43.445L40.982,43.445z" }) })
  ] }) }) }),
  // Блокнот
  notepad: /* @__PURE__ */ jsxRuntime.jsx("svg", { x: "0px", y: "0px", width: "64px", height: "64px", viewBox: "0 0 64 64", children: /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
    " ",
    /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M59,57.068C59,60.896,55.896,64,52.068,64H11.932C8.104,64,5,60.896,5,57.068V6.932C5,3.104,8.104,0,11.932,0h40.136 C55.896,0,59,3.104,59,6.932V57.068z M55,6.932C55,5.313,53.688,4,52.068,4H11.932C10.313,4,9,5.313,9,6.932v50.136 C9,58.688,10.313,60,11.932,60h40.136C53.688,60,55,58.688,55,57.068V6.932z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M19,63c-0.553,0-1-0.447-1-1V2c0-0.553,0.447-1,1-1c0.552,0,1,0.447,1,1v60C20,62.553,19.552,63,19,63z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M47.527,58H31.125c-0.553,0-1-0.447-1-1s0.447-1,1-1h16.402C49.105,56,51,54.109,51,51.184V48c0-0.553,0.447-1,1-1 s1,0.447,1,1v3.184C53,55.325,50.32,58,47.527,58z" }),
          " "
        ] }),
        " ",
        /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M51.245,43.951c-0.271,0-0.521-0.102-0.71-0.29c-0.182-0.181-0.29-0.44-0.29-0.71c0-0.262,0.108-0.521,0.29-0.71 c0.369-0.36,1.04-0.37,1.408,0c0.19,0.188,0.302,0.448,0.302,0.71c0,0.27-0.11,0.52-0.29,0.71 C51.766,43.85,51.505,43.951,51.245,43.951z" }),
          " "
        ] }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M45,22.432c-0.146,0-0.295-0.032-0.432-0.099L39,19.666l-5.568,2.668c-0.31,0.15-0.677,0.128-0.968-0.055 c-0.291-0.184-0.471-0.503-0.471-0.847V2c0-0.553,0.454-1.318,1.007-1.318h12c0.553,0,0.993,0.766,0.993,1.318v19.432 c0,0.344-0.175,0.663-0.464,0.847C45.368,22.38,45.186,22.432,45,22.432z M39,17.557c0.146,0,0.292,0.033,0.43,0.099l4.563,2.188 V2.682h-10v17.162l4.571-2.188C38.7,17.59,38.854,17.557,39,17.557z" }),
        " "
      ] }),
      " "
    ] })
  ] }) }),
  // Карандаш
  pencil: /* @__PURE__ */ jsxRuntime.jsx("svg", { x: "0px", y: "0px", width: "64px", height: "64px", viewBox: "0 0 64 64", children: /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
    " ",
    /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M2.435,63.924c-0.524,0-1.035-0.206-1.414-0.586l-0.435-0.434c-0.494-0.494-0.694-1.209-0.529-1.889 c0.606-2.49,3.786-15.07,6.883-18.166L47.062,2.728c1.71-1.711,4.009-2.652,6.475-2.652c2.606,0,5.08,1.036,6.961,2.918 l0.435,0.435c1.79,1.789,2.901,4.265,3.05,6.792c0.158,2.686-0.732,5.143-2.509,6.918L21.349,57.26 c-3.111,3.111-15.943,6.059-18.484,6.617C2.722,63.91,2.578,63.924,2.435,63.924z M53.536,4.076c-1.396,0-2.69,0.525-3.646,1.48 L9.768,45.678c-1.455,1.455-3.673,8.178-5.156,13.686c5.608-1.381,12.461-3.483,13.909-4.932L58.645,14.31 c0.956-0.957,1.435-2.326,1.344-3.854c-0.092-1.563-0.777-3.094-1.885-4.199l-0.435-0.435 C56.543,4.696,55.075,4.076,53.536,4.076z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M56.956,18.171c-0.256,0-0.513-0.098-0.707-0.293L45.495,7.125c-0.392-0.391-0.392-1.023,0-1.414 c0.391-0.391,1.022-0.391,1.414,0l10.754,10.754c0.391,0.391,0.391,1.023,0,1.414C57.468,18.074,57.212,18.171,56.956,18.171z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M20.556,54.573c-0.256,0-0.512-0.099-0.707-0.293L9.094,43.523c-0.391-0.391-0.391-1.022,0-1.414 c0.391-0.391,1.023-0.391,1.414,0l10.755,10.757c0.391,0.391,0.391,1.022,0,1.414C21.068,54.475,20.812,54.573,20.556,54.573z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12.69,59.708c-0.256,0-0.512-0.099-0.707-0.293l-6.889-6.892c-0.391-0.391-0.391-1.022,0-1.414 c0.391-0.391,1.023-0.391,1.414,0L13.397,58c0.391,0.391,0.391,1.023,0,1.414C13.202,59.609,12.946,59.708,12.69,59.708z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M13.938,47.954c-0.256,0-0.512-0.099-0.707-0.293c-0.391-0.392-0.391-1.022,0-1.414l29.783-29.782 c0.391-0.391,1.023-0.391,1.414,0c0.391,0.391,0.391,1.023,0,1.414L14.645,47.661C14.45,47.855,14.194,47.954,13.938,47.954z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M46.615,15.276c-0.257,0-0.513-0.098-0.707-0.293c-0.392-0.391-0.392-1.023,0-1.414l3.723-3.723 c0.391-0.391,1.022-0.391,1.414,0c0.391,0.391,0.391,1.023,0,1.414l-3.724,3.723C47.127,15.178,46.871,15.276,46.615,15.276z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M17.247,51.262c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l36.399-36.398 c0.392-0.391,1.023-0.391,1.414,0c0.392,0.391,0.392,1.023,0,1.414L17.954,50.969C17.758,51.165,17.502,51.262,17.247,51.262z" }),
        " "
      ] }),
      " "
    ] })
  ] }) }),
  // Выход
  quit: /* @__PURE__ */ jsxRuntime.jsx("svg", { x: "0px", y: "0px", width: "65.994px", height: "65.994px", viewBox: "0 0 65.994 65.994", children: /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
    " ",
    /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M33.753,50.937c-5.351,0-10.35-2.052-14.076-5.776l-0.658-0.658c-3.777-3.778-5.829-8.849-5.776-14.278 c0.053-5.392,2.17-10.448,5.96-14.237L29.48,5.707c0.75-0.75,2.078-0.75,2.828,0L58.472,31.87 c0.375,0.375,0.586,0.884,0.586,1.414s-0.211,1.04-0.586,1.415L48.193,44.976C44.351,48.82,39.222,50.937,33.753,50.937z M30.895,9.95l-8.863,8.863c-3.045,3.045-4.745,7.111-4.788,11.449c-0.042,4.346,1.593,8.398,4.605,11.411l0.658,0.658 c2.97,2.97,6.964,4.604,11.247,4.604c4.399,0,8.523-1.7,11.613-4.789l8.862-8.863L30.895,9.95z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M25.359,22.142c-0.256,0-0.513-0.098-0.708-0.293c-0.39-0.391-0.39-1.023,0.001-1.414l0.707-0.707 c0.391-0.391,1.024-0.391,1.415,0c0.39,0.392,0.39,1.024-0.001,1.414l-0.707,0.707C25.872,22.044,25.616,22.142,25.359,22.142z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M22.17,34.815c-0.445,0-0.852-0.299-0.968-0.75c-0.964-3.733-0.402-7.773,1.541-11.083 c0.279-0.476,0.892-0.637,1.368-0.355c0.477,0.279,0.636,0.893,0.356,1.368c-1.677,2.856-2.161,6.345-1.329,9.57 c0.139,0.535-0.184,1.08-0.718,1.219C22.337,34.807,22.253,34.815,22.17,34.815z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M3.816,65.994c-0.103,0-0.208-0.008-0.313-0.024c-1.089-0.172-1.834-1.19-1.664-2.281 c0.063-0.408,1.644-10.062,8.861-13.604c5.075-2.488,6.701-8.313,6.717-8.371c0.287-1.063,1.383-1.698,2.447-1.413 c1.065,0.283,1.7,1.372,1.42,2.438c-0.082,0.311-2.076,7.631-8.822,10.938c-5.336,2.617-6.66,10.55-6.673,10.631 C5.633,65.292,4.784,65.994,3.816,65.994z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M37.966,16.192c-0.512,0-1.023-0.194-1.414-0.586c-0.781-0.78-0.781-2.047,0-2.827L48.744,0.586 c0.779-0.781,2.048-0.781,2.828,0s0.78,2.047,0,2.828L39.38,15.606C38.99,15.997,38.477,16.192,37.966,16.192z" }),
          " "
        ] }),
        " ",
        /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M49.985,28.213c-0.512,0-1.022-0.195-1.413-0.586c-0.781-0.781-0.781-2.047,0-2.828l12.192-12.192 c0.78-0.78,2.048-0.78,2.828,0c0.781,0.781,0.781,2.048,0,2.828L51.399,27.627C51.011,28.018,50.498,28.213,49.985,28.213z" }),
          " "
        ] }),
        " "
      ] })
    ] })
  ] }) }),
  // Пользователь
  user: /* @__PURE__ */ jsxRuntime.jsx("svg", { x: "0px", y: "0px", width: "66.949px", height: "66.949px", viewBox: "0 0 66.949 66.949", children: /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
    " ",
    /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M33.558,42.628c-9.49,0-16.428-17.231-16.428-26.2C17.129,7.369,24.499,0,33.558,0c9.059,0,16.428,7.369,16.428,16.428 C49.985,25.396,43.048,42.628,33.558,42.628z M33.558,4c-6.853,0-12.428,5.575-12.428,12.428c0,7.764,6.388,22.2,12.428,22.2 c6.039,0,12.428-14.437,12.428-22.2C45.985,9.575,40.411,4,33.558,4z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M25.163,17.899c-0.553,0-1-0.447-1-1c0-5.499,4.474-9.973,9.973-9.973c0.552,0,1,0.448,1,1c0,0.553-0.448,1-1,1 c-4.396,0-7.973,3.577-7.973,7.973C26.163,17.452,25.715,17.899,25.163,17.899z" }),
          " "
        ] }),
        " ",
        /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M25.514,21.738c-0.27,0-0.52-0.1-0.71-0.29c-0.189-0.189-0.29-0.45-0.29-0.71c0-0.26,0.101-0.52,0.29-0.71 c0.37-0.37,1.04-0.37,1.41,0c0.19,0.19,0.3,0.45,0.3,0.71c0,0.271-0.109,0.521-0.3,0.71 C26.035,21.639,25.774,21.738,25.514,21.738z" }),
          " "
        ] }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M33.475,66.949c-5.649,0-24.083-0.577-24.083-8c0-10.635,7.018-20.227,17.066-23.326l1.225-0.378l0.855,0.955 c3.062,3.42,6.725,3.581,10.01-0.065l0.861-0.957l1.227,0.387c9.963,3.145,16.922,12.761,16.922,23.386 C57.558,66.372,39.124,66.949,33.475,66.949z M26.502,39.834c-7.777,2.934-13.111,10.625-13.111,19.115c0,1.102,6.175,4,20.083,4 c13.907,0,20.083-2.898,20.083-4c0-8.486-5.283-16.199-12.986-19.17c-2.141,2-4.543,3.049-7.014,3.049 C31.03,42.828,28.614,41.799,26.502,39.834z" }),
        " "
      ] }),
      " "
    ] })
  ] }) }),
  // Ошибка
  error: /* @__PURE__ */ jsxRuntime.jsx("svg", { x: "0px", y: "0px", width: "66.109px", height: "66.109px", viewBox: "0 0 66.109 66.109", children: /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
    " ",
    /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M52.311,66.109c-0.005,0-0.013,0-0.02,0H13.346c-0.621,0-1.207-0.289-1.586-0.781c-0.378-0.492-0.507-1.133-0.347-1.732 c0.55-2.065,13.49-50.68,15.78-57.185C28.162,3.659,29.792,0,32.755,0c2.94,0,4.552,3.597,5.508,6.303 c2.405,6.803,14.717,52.655,15.89,57.024c0.103,0.24,0.158,0.506,0.158,0.783C54.311,65.215,53.416,66.109,52.311,66.109z M15.95,62.109h33.733c-2.757-10.248-13.088-48.524-15.19-54.474c-0.789-2.231-1.424-3.138-1.737-3.482 c-0.321,0.35-0.975,1.277-1.787,3.586C29.021,13.267,18.696,51.824,15.95,62.109z" }),
          " "
        ] }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M59.055,66.109h-52c-1.104,0-2-0.895-2-2c0-1.104,0.896-2,2-2h52c1.104,0,2,0.896,2,2 C61.055,65.215,60.158,66.109,59.055,66.109z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M48.055,53.109h-32c-0.553,0-1-0.447-1-1s0.447-1,1-1h32c0.553,0,1,0.447,1,1S48.607,53.109,48.055,53.109z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M45.055,38.109h-7c-0.553,0-1-0.447-1-1s0.447-1,1-1h7c0.553,0,1,0.447,1,1S45.607,38.109,45.055,38.109z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M34.054,38.109h-14c-0.553,0-1-0.447-1-1s0.447-1,1-1h14c0.553,0,1,0.447,1,1S34.606,38.109,34.054,38.109z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M41.055,23.109h-16c-0.553,0-1-0.447-1-1c0-0.553,0.447-1,1-1h16c0.553,0,1,0.447,1,1 C42.055,22.662,41.607,23.109,41.055,23.109z" }),
        " "
      ] }),
      " "
    ] })
  ] }) })
};
const sanitizeText = (str) => {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
};
const errorMessages = {
  "400": {
    title: "Ошибка 400 - Неверный запрос",
    description: "Сервер не может обработать ваш запрос из-за некорректного синтаксиса."
  },
  "401": {
    title: "Ошибка 401 - Требуется авторизация",
    description: "Для доступа к этой странице необходимо войти в систему."
  },
  "403": {
    title: "Ошибка 403 - Доступ запрещён",
    description: "У вас нет прав для просмотра этой страницы."
  },
  "404": {
    title: "Ошибка 404 - Страница не найдена",
    description: "Запрошенная страница не существует или была перемещена."
  },
  "500": {
    title: "Ошибка 500 - Ошибка сервера",
    description: "Внутренняя ошибка сервера. Пожалуйста, попробуйте позже."
  }
};
const ErrorPage = () => {
  const [searchParams] = nModules.useSearchParams();
  const errorCode = sanitizeText(searchParams.get("code")) || "404";
  const customMessage = searchParams.get("message");
  const { title, description } = errorMessages[errorCode] || errorMessages["404"];
  const safeCustomMessage = customMessage ? sanitizeText(decodeURIComponent(customMessage)) : null;
  usePageTitle(`${title} | ${"Messaria"}`);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "error-page__box", role: "alert", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "visually-hidden", children: title }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "error-page", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "error-page__icon", "aria-hidden": "true", children: icon.error || "⚠️" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "error-page__text-box", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("h2", { className: "error-page__code", children: [
          "Ошибка ",
          errorCode
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "error-page__description", children: safeCustomMessage || description }),
        /* @__PURE__ */ jsxRuntime.jsx(
          nModules.Link,
          {
            to: "/",
            className: "error-page__button",
            "aria-label": "Вернуться на главную страницу",
            children: "На главную"
          }
        )
      ] })
    ] })
  ] });
};
const AppNavbar = ({ isAuth }) => {
  const location = require$$2.useLocation();
  const dispatch = reactRedux.useDispatch();
  const hasUnsavedChanges = reactRedux.useSelector((state) => state.appSettings.hasUnsavedChanges);
  const navItems = [
    { path: "/feed", icon: icon.home, label: "Главная" },
    { path: "/posts/search", icon: icon.lens, label: "Поиск новостей" },
    ...isAuth ? [
      { path: "/posts/favorites", icon: icon.notepad, label: "Избранное" },
      { path: "/posts/create", icon: icon.pencil, label: "Создать новость" }
    ] : []
  ];
  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };
  const handleProtectedClick = (path) => (e) => {
    if (isActivePath(path)) {
      e.preventDefault();
      return;
    }
    if (hasUnsavedChanges) {
      e.preventDefault();
      dispatch(setPendingNavigation(path));
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("nav", { className: "appnavbar__container", "aria-label": "Основная навигация", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      nModules.Link,
      {
        to: "/",
        className: `appnavbar__link-logo`,
        "aria-label": "На главную",
        onClick: handleProtectedClick("/"),
        children: /* @__PURE__ */ jsxRuntime.jsx("span", { role: "img", "aria-hidden": "true", children: icon.logo })
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "appnavbar__user-btn-box", children: navItems.map((item) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsx(
      nModules.Link,
      {
        to: item.path,
        className: isActivePath(item.path) ? "appnavbar__active-btn" : "",
        "aria-current": isActivePath(item.path) ? "page" : void 0,
        title: item.label,
        onClick: handleProtectedClick(item.path),
        children: /* @__PURE__ */ jsxRuntime.jsx("span", { role: "img", "aria-label": item.label, children: item.icon })
      }
    ) }, item.path)) }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "appnavbar__user-box", children: isAuth ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        nModules.Link,
        {
          to: "/auth/logout",
          className: `appnavbar__btn-quit`,
          onClick: (e) => {
            handleProtectedClick("/auth/logout")(e);
          },
          title: "Выйти",
          children: /* @__PURE__ */ jsxRuntime.jsx("span", { role: "img", "aria-label": "Выйти", children: icon.quit })
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        nModules.Link,
        {
          to: "/user/settings",
          className: `appnavbar__btn-user`,
          title: "Настройки профиля",
          onClick: handleProtectedClick("/user/settings"),
          children: /* @__PURE__ */ jsxRuntime.jsx("span", { role: "img", "aria-label": "Профиль", children: icon.user })
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntime.jsx(
      nModules.Link,
      {
        to: "/auth/sign-in",
        className: `appnavbar__btn-user`,
        title: "Войти",
        onClick: handleProtectedClick("/auth/sign-in"),
        children: /* @__PURE__ */ jsxRuntime.jsx("span", { role: "img", "aria-label": "Войти", children: icon.user })
      }
    ) })
  ] });
};
const AppNavbar$1 = React.memo(AppNavbar);
const ConfirmNavigationModal = () => {
  const dispatch = reactRedux.useDispatch();
  const navigate = require$$2.useNavigate();
  const { pendingNavigation, hasUnsavedChanges } = reactRedux.useSelector((state) => state.appSettings);
  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = "У вас есть несохраненные изменения. Вы уверены, что хотите уйти?";
    }
  };
  React.useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
  const handleConfirm = () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    dispatch(setUnsavedChanges(false));
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    dispatch(clearPendingNavigation());
  };
  const handleCancel = () => {
    dispatch(clearPendingNavigation());
  };
  if (!pendingNavigation) return null;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "confirm-modal", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "confirm-modal__content", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "confirm-modal__title", children: "Несохраненные изменения" }),
    /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "confirm-modal__message", children: [
      "У вас есть несохраненные изменения. ",
      /* @__PURE__ */ jsxRuntime.jsx("br", {}),
      "Вы уверены, что хотите уйти?",
      /* @__PURE__ */ jsxRuntime.jsx("br", {}),
      "Все несохраненные изменения будут потеряны."
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "confirm-modal__actions", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          className: "confirm-modal__button confirm-modal__button--cancel",
          onClick: handleCancel,
          children: "Отмена"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          className: "confirm-modal__button confirm-modal__button--confirm",
          onClick: handleConfirm,
          children: "Выйти"
        }
      )
    ] })
  ] }) });
};
const AppLayout = () => {
  const dispatch = reactRedux.useDispatch();
  const { isAuth, authCheckStatus } = reactRedux.useSelector((state) => state.userData);
  React.useEffect(() => {
    let interval;
    let isMounted = true;
    const startInterval = () => {
      if (isMounted && isAuth && authCheckStatus !== "logout") {
        interval = setInterval(() => {
          dispatch(checkToken());
        }, 6 * 60 * 1e3);
      }
    };
    if (authCheckStatus === "idle") {
      dispatch(checkToken());
    }
    startInterval();
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [dispatch, isAuth, authCheckStatus]);
  const logout = (eo) => {
    eo.preventDefault();
    dispatch(logoutUser());
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "applayout__container", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "applayout__nav", children: /* @__PURE__ */ jsxRuntime.jsx(AppNavbar$1, { isAuth, logout }) }),
    /* @__PURE__ */ jsxRuntime.jsxs("main", { className: "applayout__main", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ConfirmNavigationModal, {}),
      /* @__PURE__ */ jsxRuntime.jsx(require$$2.Outlet, {})
    ] })
  ] });
};
const AppLayout$1 = React.memo(AppLayout);
const PostsListPage = () => {
  const dispatch = reactRedux.useDispatch();
  const navigate = require$$2.useNavigate();
  const { isAuth, isAdmin } = reactRedux.useSelector((state) => state.userData);
  const { userPosts, favoritePosts, statusFavList } = reactRedux.useSelector((state) => state.postsData);
  const [activeTab, setActiveTab] = React.useState("my");
  React.useEffect(() => {
    if (isAuth) {
      dispatch(fetchUserPosts());
      dispatch(fetchFavoritePosts());
    }
  }, [dispatch, isAuth]);
  const handleDelete = async (postId, e) => {
    e.stopPropagation();
    if (window.confirm("Вы уверены, что хотите удалить этот пост?")) {
      await dispatch(deletePost(postId));
      dispatch(fetchUserPosts());
      dispatch(fetchFavoritePosts());
    }
  };
  const handleToggleFavorite = async (postId, e) => {
    e.stopPropagation();
    const isFav = favoritePosts.some((p) => p.id === postId);
    const action = isFav ? removeFavorite : addFavorite;
    await dispatch(action({ postId }));
    dispatch(fetchFavoritePosts());
  };
  const handlePostClick = (postId) => {
    navigate(`/posts/view/${postId}`);
  };
  const handleEdit = (postId, e) => {
    e.stopPropagation();
    navigate(`/posts/edit/${postId}`);
  };
  if (statusFavList === "loading") return /* @__PURE__ */ jsxRuntime.jsx(LoadingSpinner, {});
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-list-page", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "posts-list-page__page-title", children: " Блокнот " }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-list-page__tabs", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          className: `posts-list-page__tab-btn ${activeTab === "my" ? "posts-list-page__tab-btn--active" : ""}`,
          onClick: () => setActiveTab("my"),
          children: "Мои посты"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          className: `posts-list-page__tab-btn ${activeTab === "favorites" ? "posts-list-page__tab-btn--active" : ""}`,
          onClick: () => setActiveTab("favorites"),
          children: "Избранное"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-list-page__posts-container", children: [
      (activeTab === "my" ? userPosts : favoritePosts).map((post) => {
        var _a;
        return /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: "posts-list-page__post-item",
            onClick: () => handlePostClick(post.id),
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-list-page__post-content", children: [
                /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "posts-list-page__post-title", children: post.title }),
                /* @__PURE__ */ jsxRuntime.jsx("p", { className: "posts-list-page__post-description", children: post.description || "Без описания" }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-list-page__post-meta", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                    "Автор: ",
                    ((_a = post.author) == null ? void 0 : _a.username) || "Неизвестно"
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                    "Статус: ",
                    post.status === "published" ? "Опубликован" : "Черновик"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-list-page__post-actions", children: [
                activeTab === "my" && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "button",
                    {
                      className: "posts-list-page__action-btn",
                      onClick: (e) => handleEdit(post.id, e),
                      title: "Редактировать",
                      children: /* @__PURE__ */ jsxRuntime.jsx(md.MdEdit, { size: 20 })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "button",
                    {
                      className: "posts-list-page__action-btn",
                      onClick: (e) => handleDelete(post.id, e),
                      title: "Удалить",
                      children: /* @__PURE__ */ jsxRuntime.jsx(ri.RiDeleteBin7Fill, { size: 20 })
                    }
                  )
                ] }),
                activeTab === "favorites" && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "button",
                    {
                      className: `posts-list-page__action-btn posts-list-page__fav-btn`,
                      onClick: (e) => handleToggleFavorite(post.id, e),
                      title: "Убрать из избранного",
                      children: /* @__PURE__ */ jsxRuntime.jsx(fa.FaBookmark, { size: 20 })
                    }
                  ),
                  isAdmin && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "button",
                      {
                        className: "posts-list-page__action-btn",
                        onClick: (e) => handleEdit(post.id, e),
                        title: "Редактировать",
                        children: /* @__PURE__ */ jsxRuntime.jsx(md.MdEdit, { size: 20 })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsx(
                      "button",
                      {
                        className: "posts-list-page__action-btn",
                        onClick: (e) => handleDelete(post.id, e),
                        title: "Удалить",
                        children: /* @__PURE__ */ jsxRuntime.jsx(ri.RiDeleteBin7Fill, { size: 20 })
                      }
                    )
                  ] })
                ] })
              ] })
            ]
          },
          post.id
        );
      }),
      activeTab === "my" && userPosts.length === 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-list-page__empty-state", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { children: "У вас пока нет постов" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            className: "posts-list-page__create-btn",
            onClick: () => navigate("/posts/create"),
            children: "Создать первый пост"
          }
        )
      ] }),
      activeTab === "favorites" && favoritePosts.length === 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-list-page__empty-state", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { children: "У вас пока нет избранных постов" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            className: "posts-list-page__search-btn",
            onClick: () => navigate("/posts/search"),
            children: "Найти интересные посты"
          }
        )
      ] })
    ] })
  ] });
};
const PostsListPage$1 = React.memo(PostsListPage);
const PostCard = React.forwardRef(({ post }, ref) => {
  var _a;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "post-card", ref, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "post-card__content", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "post-card__title", children: /* @__PURE__ */ jsxRuntime.jsx(nModules.Link, { to: `/posts/view/${post.id}`, children: post.title }) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "post-card__meta", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "post-card__author", children: [
        "Автор: ",
        ((_a = post.author) == null ? void 0 : _a.username) || "Неизвестный автор"
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "post-card__date", children: new Date(post.createdAt).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "post-card__excerpt", children: [
      post.excerpt,
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "post-card__fade" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "post-card__actions", children: /* @__PURE__ */ jsxRuntime.jsx(nModules.Link, { to: `/posts/view/${post.id}`, className: "post-card__read-more", children: "Читать полностью" }) })
  ] }) });
});
const PostCard$1 = React.memo(PostCard);
const FeedPage = () => {
  const dispatch = reactRedux.useDispatch();
  const {
    feedPosts,
    feedPage,
    feedTotalPages,
    feedStatus
  } = reactRedux.useSelector((state) => state.postsData);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const observer = React.useRef();
  React.useEffect(() => {
    dispatch(fetchFeedPosts({ page: 1 }));
  }, []);
  const lastPostRef = React.useCallback((node) => {
    if (feedStatus === "loading" || feedStatus === "loading-more") return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && feedPage < feedTotalPages) {
        setIsLoadingMore(true);
        dispatch(fetchFeedPosts({ page: feedPage + 1 })).finally(() => setIsLoadingMore(false));
      }
    });
    if (node) observer.current.observe(node);
  }, [feedStatus, feedPage, feedTotalPages, dispatch]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "feed-page", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "feed-page__title", children: "Лента постов" }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "feed-page__posts", children: feedPosts.map((post, index) => /* @__PURE__ */ jsxRuntime.jsx(
      PostCard$1,
      {
        post,
        ref: index === feedPosts.length - 1 ? lastPostRef : null
      },
      `${post.id}-${index}`
    )) }),
    (feedStatus === "loading" || isLoadingMore) && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "feed-page__loader", children: /* @__PURE__ */ jsxRuntime.jsx(LoadingSpinner, {}) }),
    feedStatus === "succeeded" && feedPosts.length === 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "feed-page__empty", children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { children: "Пока нет постов в ленте" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { children: "Будьте первым, кто создаст пост!" })
    ] }),
    feedStatus === "succeeded" && feedPosts.length > 0 && feedPage < feedTotalPages && !isLoadingMore && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "feed-page__pagination", children: /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        className: "feed-page__load-more",
        onClick: () => {
          setIsLoadingMore(true);
          dispatch(fetchFeedPosts({ page: feedPage + 1 })).finally(() => setIsLoadingMore(false));
        },
        disabled: isLoadingMore,
        children: isLoadingMore ? "Загрузка..." : "Загрузить еще"
      }
    ) })
  ] });
};
const PostsLayout = () => {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "postslayout__container", children: /* @__PURE__ */ jsxRuntime.jsx(require$$2.Outlet, {}) });
};
const UserLayout = () => {
  return /* @__PURE__ */ jsxRuntime.jsx(require$$2.Outlet, {});
};
const AuthLayout = () => {
  return /* @__PURE__ */ jsxRuntime.jsx("main", { className: "authlayout__main", children: /* @__PURE__ */ jsxRuntime.jsx(require$$2.Outlet, {}) });
};
function useDeepCompareEffect(callback, dependencies) {
  const prevDepsRef = React.useRef([]);
  const isFirstRender = React.useRef(true);
  const serializedDeps = dependencies.map((dep) => JSON.stringify(dep));
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevDepsRef.current = serializedDeps;
      return;
    }
    const hasChanged = serializedDeps.some(
      (dep, index) => dep !== prevDepsRef.current[index]
    );
    if (hasChanged) {
      callback();
      prevDepsRef.current = serializedDeps;
    }
  }, [callback, ...serializedDeps]);
}
const MetaBlock = React.forwardRef(({ initialMeta, onChange }, ref) => {
  const titleRef = React.useRef();
  const descriptionRef = React.useRef();
  const keywordsRef = React.useRef();
  const [localMeta, setLocalMeta] = React.useState({
    title: (initialMeta == null ? void 0 : initialMeta.title) || "",
    description: (initialMeta == null ? void 0 : initialMeta.description) || "",
    keywords: (initialMeta == null ? void 0 : initialMeta.keywords) || ""
  });
  const [errors, setErrors] = React.useState({
    title: false,
    description: false,
    keywords: false
  });
  useDeepCompareEffect(() => {
    onChange();
  }, [localMeta]);
  React.useEffect(() => {
    setLocalMeta({
      title: (initialMeta == null ? void 0 : initialMeta.title) || "",
      description: (initialMeta == null ? void 0 : initialMeta.description) || "",
      keywords: (initialMeta == null ? void 0 : initialMeta.keywords) || ""
    });
    setErrors({ title: false, description: false, keywords: false });
  }, [initialMeta]);
  const onUpdate = (updatedFields) => {
    setLocalMeta((prev) => ({
      ...prev,
      ...updatedFields
    }));
  };
  React.useImperativeHandle(ref, () => ({
    validateMeta() {
      const newErrors = {
        title: !localMeta.title.trim(),
        description: !localMeta.description.trim(),
        keywords: !localMeta.keywords.trim()
      };
      setErrors(newErrors);
      if (newErrors.title) {
        titleRef.current.focus();
        return false;
      }
      if (newErrors.description) {
        descriptionRef.current.focus();
        return false;
      }
      if (newErrors.keywords) {
        keywordsRef.current.focus();
        return false;
      }
      return true;
    },
    getMeta() {
      return { ...localMeta };
    }
  }));
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "metablock", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "metablock__field", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "metablock__label", children: [
        "Заглавие*",
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            ref: titleRef,
            type: "text",
            name: "title",
            value: localMeta.title,
            onChange: (e) => onUpdate({ title: e.target.value }),
            className: `metablock__input ${errors.title ? "metablock__input--error" : ""}`,
            placeholder: "Заглавие статьи"
          }
        )
      ] }),
      errors.title && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "metablock__error", children: "Поле обязательно для заполнения (заглавие статьи)." })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "metablock__field", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "metablock__label", children: [
        "Meta description*",
        /* @__PURE__ */ jsxRuntime.jsx(
          "textarea",
          {
            name: "description",
            ref: descriptionRef,
            value: localMeta.description,
            onChange: (e) => onUpdate({ description: e.target.value }),
            className: `metablock__textarea ${errors.description ? "metablock__textarea--error" : ""}`,
            placeholder: "Короткое описание для поисковых систем"
          }
        )
      ] }),
      errors.description && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "metablock__error", children: "Поле обязательно для заполнения (короткое описание статьи)." })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "metablock__field", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "metablock__label", children: [
        "Meta keywords*",
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            ref: keywordsRef,
            type: "text",
            name: "keywords",
            value: localMeta.keywords,
            onChange: (e) => onUpdate({ keywords: e.target.value }),
            className: `metablock__input ${errors.keywords ? "metablock__input--error" : ""}`,
            placeholder: "Ключевые слова через запятую"
          }
        )
      ] }),
      errors.keywords && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "metablock__error", children: "Поле обязательно для заполнения (ключевые слова через запятую)." })
    ] })
  ] });
});
const MetaBlock$1 = React.memo(MetaBlock);
const AddMenu = ({ index, onAdd }) => {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const toggle = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };
  const handleAdd = (type) => {
    onAdd(index, type);
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { ref: menuRef, className: "addmenu", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "addmenu__container", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: toggle,
          className: "addmenu__toggle",
          title: "Добавить блок",
          type: "button",
          children: /* @__PURE__ */ jsxRuntime.jsx(fa.FaPlus, { size: "20" })
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "addmenu__divider" })
    ] }),
    open && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "addmenu__menu", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: () => handleAdd("text"),
          className: "addmenu__button",
          title: "Текст",
          type: "button",
          children: /* @__PURE__ */ jsxRuntime.jsx(fa6.FaT, { className: "addmenu__icon" })
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: () => handleAdd("heading"),
          className: "addmenu__button",
          title: "Заголовок",
          type: "button",
          children: /* @__PURE__ */ jsxRuntime.jsx(lu.LuHeading, { className: "addmenu__icon", size: "20" })
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          onClick: () => handleAdd("image"),
          className: "addmenu__button",
          title: "Изображение",
          type: "button",
          children: /* @__PURE__ */ jsxRuntime.jsx(fa.FaRegImage, { className: "addmenu__icon", size: "20" })
        }
      )
    ] })
  ] });
};
const AddMenu$1 = React.memo(AddMenu);
const DEFAULT_FORMATTING$2 = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  color: "#000000",
  alignment: "left",
  fontSize: 14,
  useMarginTop: false,
  marginTop: 0,
  useMarginBottom: false,
  marginBottom: 0
};
const formatButtons$1 = [
  {
    format: "bold",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaBold, {}),
    title: "Жирный",
    disabledBtn: false
  },
  {
    format: "italic",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaItalic, {}),
    title: "Курсив",
    disabledBtn: false
  },
  {
    format: "underline",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaUnderline, {}),
    title: "Подчёркнутый",
    disabledBtn: false
  },
  {
    format: "strikethrough",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaStrikethrough, {}),
    title: "Зачёркнутый",
    disabledBtn: false
  }
];
const alignmentButtons$1 = [
  {
    value: "left",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaAlignLeft, {}),
    title: "По левому краю",
    disabledBtn: false
  },
  {
    value: "center",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaAlignCenter, {}),
    title: "По центру",
    disabledBtn: false
  },
  {
    value: "right",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaAlignRight, {}),
    title: "По правому краю",
    disabledBtn: false
  },
  {
    value: "justify",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaAlignJustify, {}),
    title: "Растянуть",
    disabledBtn: false
  }
];
const fontSizeOptions = [
  { value: 10, label: "10px" },
  { value: 12, label: "12px" },
  { value: 14, label: "14px" },
  { value: 16, label: "16px" },
  { value: 18, label: "18px" },
  { value: 20, label: "20px" },
  { value: 24, label: "24px" }
];
const TextBlock = React.forwardRef(({ block, onChange, showSettings }, ref) => {
  const textareaRef = React.useRef();
  const [text, setText] = React.useState(block.content || "");
  const [formatting, setFormatting] = React.useState({
    ...DEFAULT_FORMATTING$2,
    ...block.formatting
  });
  const [error, setError] = React.useState(false);
  useDeepCompareEffect(() => {
    onChange();
  }, [text, formatting]);
  React.useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };
    adjustHeight();
    window.addEventListener("resize", adjustHeight);
    return () => {
      window.removeEventListener("resize", adjustHeight);
    };
  }, []);
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);
  const updateFormatting = React.useCallback((changesObj) => {
    const newFormatting = { ...formatting, ...changesObj };
    setFormatting(newFormatting);
  }, [formatting]);
  const isFormatActive = React.useCallback((button) => {
    if (button.format) {
      return formatting[button.format];
    }
    return formatting.alignment === button.value;
  }, [formatting]);
  const handleInputChange = React.useCallback((key, value, min = 0, max = 100) => {
    let numValue = parseInt(value, 10) || min;
    numValue = Math.max(min, Math.min(max, numValue));
    updateFormatting({ [key]: numValue });
  }, [updateFormatting]);
  const handleFontSizeChange = React.useCallback((e) => {
    updateFormatting({ fontSize: Number(e.target.value) });
  }, [updateFormatting]);
  const handleFormatButtonClick = React.useCallback((button) => (e) => {
    e.preventDefault();
    if (button.format) {
      updateFormatting({ [button.format]: !formatting[button.format] });
    } else if (button.value) {
      updateFormatting({ alignment: button.value });
    }
  }, [updateFormatting, formatting]);
  const renderFormatButton = React.useCallback((button) => /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      disabled: button.disabledBtn,
      onClick: handleFormatButtonClick(button),
      className: `textblock__format-btn ${isFormatActive(button) ? "textblock__format-btn--active" : ""}`,
      title: `${button.title} ${button.disabledBtn ? `- недоступно` : ``}`,
      children: button.icon
    },
    button.format || button.value
  ), [handleFormatButtonClick, isFormatActive, formatting]);
  const handleFontColorChange = React.useCallback((e) => {
    updateFormatting({ color: e.target.value });
  }, [updateFormatting]);
  const handleMarginTopToggle = React.useCallback(() => {
    updateFormatting({
      useMarginTop: !formatting.useMarginTop,
      marginTop: formatting.useMarginTop ? void 0 : DEFAULT_FORMATTING$2.marginTop
    });
  }, [formatting.useMarginTop, updateFormatting]);
  const handleMarginTopChange = React.useCallback((e) => {
    handleInputChange("marginTop", e.target.value, 1, 50);
  }, [handleInputChange]);
  const handleMarginBottomToggle = React.useCallback(() => {
    updateFormatting({
      useMarginBottom: !formatting.useMarginBottom,
      marginBottom: formatting.useMarginBottom ? void 0 : DEFAULT_FORMATTING$2.marginBottom
    });
  }, [formatting.useMarginBottom, updateFormatting]);
  const handleMarginBottomChange = React.useCallback((e) => {
    handleInputChange("marginBottom", e.target.value, 1, 50);
  }, [handleInputChange]);
  const handleTextChange = React.useCallback((e) => {
    const newText = e.target.value;
    setText(newText);
    setError(false);
  }, []);
  const getTextareaStyle = () => {
    return {
      textAlign: formatting.alignment,
      fontWeight: formatting.bold ? "bold" : "normal",
      fontStyle: formatting.italic ? "italic" : "normal",
      textDecoration: formatting.underline ? formatting.strikethrough ? "underline line-through" : "underline" : formatting.strikethrough ? "line-through" : "none",
      color: formatting.color,
      fontSize: `${formatting.fontSize}px`,
      marginTop: formatting.useMarginTop ? `${formatting.marginTop}px` : "0",
      marginBottom: formatting.useMarginBottom ? `${formatting.marginBottom}px` : "0"
    };
  };
  React.useImperativeHandle(ref, () => ({
    validate() {
      var _a;
      if (!text.trim()) {
        setError("Текст не может быть пустым");
        (_a = textareaRef.current) == null ? void 0 : _a.focus();
        return false;
      }
      setError(null);
      return true;
    },
    getContent: () => ({
      content: text,
      formatting: { ...formatting }
    })
  }));
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "textblock", children: [
    showSettings && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "textblock__toolbar", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "textblock__toolbar-section", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "textblock__format-group", children: /* @__PURE__ */ jsxRuntime.jsx(
        "select",
        {
          value: formatting.fontSize,
          onChange: handleFontSizeChange,
          className: "textblock__select",
          title: "Размер шрифта",
          children: fontSizeOptions.map((option) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: option.value, children: option.label }, option.value))
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "textblock__toolbar-section", children: formatButtons$1.map(renderFormatButton) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "textblock__toolbar-section", children: alignmentButtons$1.map(renderFormatButton) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "textblock__toolbar-section", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "textblock__color-container", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "color",
            value: formatting.color,
            onChange: handleFontColorChange,
            className: "textblock__color-input",
            title: "Цвет текста"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: "textblock__color-preview",
            style: { backgroundColor: formatting.color }
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "textblock__toolbar-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: handleMarginTopToggle,
            className: `textblock__format-btn ${formatting.useMarginTop ? "textblock__format-btn--active" : ""}`,
            title: formatting.useMarginTop ? "Убрать отступ сверху" : "Добавить отступ сверху",
            children: /* @__PURE__ */ jsxRuntime.jsx(md.MdVerticalAlignTop, {})
          }
        ),
        formatting.useMarginTop && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "textblock__input-group", children: /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "number",
            min: "1",
            max: "50",
            value: formatting.marginTop,
            onChange: handleMarginTopChange,
            className: "textblock__number-input",
            title: "Отступ сверху (1-50px)"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "textblock__toolbar-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: handleMarginBottomToggle,
            className: `textblock__format-btn ${formatting.useMarginBottom ? "textblock__format-btn--active" : ""}`,
            title: formatting.useMarginBottom ? "Убрать отступ снизу" : "Добавить отступ снизу",
            children: /* @__PURE__ */ jsxRuntime.jsx(md.MdVerticalAlignBottom, {})
          }
        ),
        formatting.useMarginBottom && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "textblock__input-group", children: /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "number",
            min: "1",
            max: "50",
            value: formatting.marginBottom,
            onChange: handleMarginBottomChange,
            className: "textblock__number-input",
            title: "Отступ снизу (0-50px)"
          }
        ) })
      ] })
    ] }),
    showSettings && /* @__PURE__ */ jsxRuntime.jsx("hr", {}),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "textblock__editor", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "textarea",
        {
          ref: textareaRef,
          value: text,
          onChange: handleTextChange,
          className: `textblock__textarea ${error ? "textblock__textarea--error" : ""}`,
          style: getTextareaStyle(),
          placeholder: "Введите текст...",
          rows: "1"
        }
      ),
      error && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "textblock__error", children: error })
    ] })
  ] });
});
const TextBlock$1 = React.memo(TextBlock);
const DEFAULT_FORMATTING$1 = {
  bold: true,
  italic: false,
  underline: false,
  strikethrough: false,
  color: "#000000",
  alignment: "left",
  level: 2,
  useMarginTop: false,
  marginTop: 0,
  useMarginBottom: false,
  marginBottom: 0
};
const formatButtons = [
  {
    format: "bold",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaBold, {}),
    title: "Жирный",
    disabledBtn: true
  },
  {
    format: "italic",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaItalic, {}),
    title: "Курсив",
    disabledBtn: false
  },
  {
    format: "underline",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaUnderline, {}),
    title: "Подчёркнутый",
    disabledBtn: false
  },
  {
    format: "strikethrough",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaStrikethrough, {}),
    title: "Зачёркнутый",
    disabledBtn: false
  }
];
const alignmentButtons = [
  {
    value: "left",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaAlignLeft, {}),
    title: "По левому краю",
    disabledBtn: false
  },
  {
    value: "center",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaAlignCenter, {}),
    title: "По центру",
    disabledBtn: false
  },
  {
    value: "right",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaAlignRight, {}),
    title: "По правому краю",
    disabledBtn: false
  },
  {
    value: "justify",
    icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaAlignJustify, {}),
    title: "Растянуть",
    disabledBtn: false
  }
];
const levelOptions = [
  { value: 2, label: "H2" },
  { value: 3, label: "H3" },
  { value: 4, label: "H4" },
  { value: 5, label: "H5" },
  { value: 6, label: "H6" }
];
const fontSizeMap$1 = {
  2: "1.8em",
  3: "1.5em",
  4: "1.25em",
  5: "1.1em",
  6: "1em"
};
const HeadingBlock = React.forwardRef(({ block, onChange, showSettings }, ref) => {
  const textareaRef = React.useRef();
  const [text, setText] = React.useState(block.content || "");
  const [formatting, setFormatting] = React.useState({
    ...DEFAULT_FORMATTING$1,
    ...block.formatting
  });
  const [error, setError] = React.useState(null);
  useDeepCompareEffect(() => {
    onChange();
  }, [text, formatting]);
  React.useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };
    adjustHeight();
    window.addEventListener("resize", adjustHeight);
    return () => {
      window.removeEventListener("resize", adjustHeight);
    };
  }, []);
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);
  const updateFormatting = React.useCallback((changesObj) => {
    const newFormatting = { ...formatting, ...changesObj };
    setFormatting(newFormatting);
  }, [formatting]);
  const isFormatActive = (button) => {
    if (button.format) {
      return formatting[button.format];
    }
    return formatting.alignment === button.value;
  };
  const handleInputChange = React.useCallback((key, value, min = 0, max = 100) => {
    let numValue = parseInt(value, 10) || min;
    numValue = Math.max(min, Math.min(max, numValue));
    updateFormatting({ [key]: numValue });
  }, [updateFormatting]);
  const handleLevelChange = React.useCallback((e) => {
    updateFormatting({ level: Number(e.target.value) });
  }, [updateFormatting]);
  const handleFormatButtonClick = React.useCallback((button) => (e) => {
    e.preventDefault();
    if (button.format) {
      updateFormatting({ [button.format]: !formatting[button.format] });
    } else if (button.value) {
      updateFormatting({ alignment: button.value });
    }
  }, [updateFormatting, formatting]);
  const renderFormatButton = (button) => /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      disabled: button.disabledBtn,
      onClick: handleFormatButtonClick(button),
      className: `headingblock__format-btn ${isFormatActive(button) ? "headingblock__format-btn--active" : ""}`,
      title: `${button.title} ${button.disabledBtn ? `- недоступно` : ``}`,
      children: button.icon
    },
    button.format || button.value
  );
  const handleFontColorChange = React.useCallback((e) => {
    updateFormatting({ color: e.target.value });
  }, [updateFormatting]);
  const handleMarginTopToggle = React.useCallback(() => {
    updateFormatting({
      useMarginTop: !formatting.useMarginTop,
      marginTop: formatting.useMarginTop ? void 0 : DEFAULT_FORMATTING$1.marginTop
    });
  }, [formatting.useMarginTop, updateFormatting]);
  const handleMarginTopChange = React.useCallback((e) => {
    handleInputChange("marginTop", e.target.value, 1, 50);
  }, [handleInputChange]);
  const handleMarginBottomToggle = React.useCallback(() => {
    updateFormatting({
      useMarginBottom: !formatting.useMarginBottom,
      marginBottom: formatting.useMarginBottom ? void 0 : DEFAULT_FORMATTING$1.marginBottom
    });
  }, [formatting.useMarginBottom, updateFormatting]);
  const handleMarginBottomChange = React.useCallback((e) => {
    handleInputChange("marginBottom", e.target.value, 1, 50);
  }, [handleInputChange]);
  const handleTextChange = React.useCallback((e) => {
    const newText = e.target.value;
    setText(newText);
    setError(false);
  }, []);
  const getTextareaStyle = () => {
    return {
      textAlign: formatting.alignment,
      fontWeight: formatting.bold ? "bold" : "normal",
      fontStyle: formatting.italic ? "italic" : "normal",
      textDecoration: formatting.underline ? formatting.strikethrough ? "underline line-through" : "underline" : formatting.strikethrough ? "line-through" : "none",
      color: formatting.color,
      fontSize: fontSizeMap$1[formatting.level] || "1.8em",
      marginTop: formatting.useMarginTop ? `${formatting.marginTop}px` : "0",
      marginBottom: formatting.useMarginBottom ? `${formatting.marginBottom}px` : "0"
    };
  };
  React.useImperativeHandle(ref, () => ({
    validate() {
      var _a;
      if (!text.trim()) {
        setError("Заголовок не может быть пустым");
        (_a = textareaRef.current) == null ? void 0 : _a.focus();
        return false;
      }
      setError(null);
      return true;
    },
    getContent: () => ({
      content: text,
      formatting: { ...formatting }
    })
  }));
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "headingblock", children: [
    showSettings && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "headingblock__toolbar", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "headingblock__toolbar-section", children: /* @__PURE__ */ jsxRuntime.jsx(
        "select",
        {
          value: formatting.level,
          onChange: handleLevelChange,
          className: "headingblock__select",
          title: "Уровень заголовка",
          children: levelOptions.map((option) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: option.value, children: option.label }, option.value))
        }
      ) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "headingblock__toolbar-section", children: formatButtons.map(renderFormatButton) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "headingblock__toolbar-section", children: alignmentButtons.map(renderFormatButton) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "headingblock__toolbar-section", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "headingblock__color-container", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "color",
            value: formatting.color,
            onChange: handleFontColorChange,
            className: "headingblock__color-input",
            title: "Цвет текста"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: "headingblock__color-preview",
            style: { backgroundColor: formatting.color }
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "headingblock__toolbar-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: handleMarginTopToggle,
            className: `headingblock__format-btn ${formatting.useMarginTop ? "headingblock__format-btn--active" : ""}`,
            title: formatting.useMarginTop ? "Убрать отступ сверху" : "Добавить отступ сверху",
            children: /* @__PURE__ */ jsxRuntime.jsx(md.MdVerticalAlignTop, {})
          }
        ),
        formatting.useMarginTop && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "headingblock__input-group", children: /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "number",
            min: "1",
            max: "50",
            value: formatting.marginTop,
            onChange: handleMarginTopChange,
            className: "headingblock__number-input",
            title: "Отступ сверху (1-50px)"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "headingblock__toolbar-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: handleMarginBottomToggle,
            className: `headingblock__format-btn ${formatting.useMarginBottom ? "headingblock__format-btn--active" : ""}`,
            title: formatting.useMarginBottom ? "Убрать отступ снизу" : "Добавить отступ снизу",
            children: /* @__PURE__ */ jsxRuntime.jsx(md.MdVerticalAlignBottom, {})
          }
        ),
        formatting.useMarginBottom && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "headingblock__input-group", children: /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "number",
            min: "1",
            max: "50",
            value: formatting.marginBottom,
            onChange: handleMarginBottomChange,
            className: "headingblock__number-input",
            title: "Отступ снизу (0-50px)"
          }
        ) })
      ] })
    ] }),
    showSettings && /* @__PURE__ */ jsxRuntime.jsx("hr", {}),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "headingblock__editor", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "textarea",
        {
          ref: textareaRef,
          value: text,
          onChange: handleTextChange,
          className: `headingblock__textarea ${error ? "headingblock__textarea--error" : ""}`,
          style: getTextareaStyle(),
          placeholder: "Введите заголовок...",
          rows: "1"
        }
      ),
      error && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "headingblock__error", children: error })
    ] })
  ] });
});
const HeadingBlock$1 = React.memo(HeadingBlock);
const STATIC_SERVER = "";
function getImageSrc(path) {
  if (!path) return "";
  const isAbsolute = /^(https?:)?\/\//i.test(path) || path.startsWith("blob:");
  if (isAbsolute) {
    return path;
  } else {
    return STATIC_SERVER.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
  }
}
const DEFAULT_FORMATTING = {
  showAlt: false,
  alignment: "left",
  useBorder: false,
  borderWidth: 0,
  borderStyle: "solid",
  borderColor: "#cccccc",
  useBorderRadius: false,
  borderRadius: 0,
  useResize: false,
  size: 100,
  useMarginTop: false,
  marginTop: 0,
  useMarginBottom: false,
  marginBottom: 0
};
const alignOptions = [
  { value: "left", icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaAlignLeft, {}), title: "Прижать к левому краю" },
  { value: "center", icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaAlignCenter, {}), title: "Выровнять по центру" },
  { value: "right", icon: /* @__PURE__ */ jsxRuntime.jsx(fa.FaAlignRight, {}), title: "Прижать к правому краю" }
];
const borderStyleOptions = [
  { value: "solid", label: "Сплошная" },
  { value: "dashed", label: "Пунктир" },
  { value: "dotted", label: "Точки" },
  { value: "double", label: "Двойная" }
];
const supportedFormats = ["image/jpeg", "image/png", "image/webp"];
const acceptString = supportedFormats.join(",");
const ImageBlock = React.forwardRef(({ block, onChange, showSettings }, ref) => {
  const dispatch = reactRedux.useDispatch();
  const altRef = React.useRef();
  const fileNameRef = React.useRef();
  const fileInputRef = React.useRef();
  const getInitialDataFile = React.useCallback(() => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return {
      content: block.content || "",
      data: {
        alt: ((_a = block.data) == null ? void 0 : _a.alt) || "",
        fileName: ((_b = block.data) == null ? void 0 : _b.fileName) || null,
        fileType: ((_c = block.data) == null ? void 0 : _c.fileType) || null,
        fileSize: ((_d = block.data) == null ? void 0 : _d.fileSize) || null,
        fileKey: ((_e = block.data) == null ? void 0 : _e.fileKey) || null,
        size: ((_f = block.data) == null ? void 0 : _f.size) || null,
        naturalHeight: ((_g = block.data) == null ? void 0 : _g.naturalHeight) || null,
        naturalWidth: ((_h = block.data) == null ? void 0 : _h.naturalWidth) || null
      }
    };
  }, [block]);
  const getInitialFormatting = React.useCallback(() => ({
    ...DEFAULT_FORMATTING,
    ...block.formatting
  }), [block.formatting]);
  const [dataFile, setDataFile] = React.useState(getInitialDataFile);
  const [formatting, setFormatting] = React.useState(getInitialFormatting);
  const [errors, setErrors] = React.useState({ content: false, alt: false, fileName: false });
  useDeepCompareEffect(() => {
    onChange();
  }, [dataFile, formatting]);
  const updateFormatting = React.useCallback((changesObj) => {
    const newFormatting = { ...formatting, ...changesObj };
    setFormatting(newFormatting);
  }, [formatting]);
  const handleInputChange = React.useCallback((key, value, min = 0, max = 100) => {
    let numValue = parseInt(value, 10) || min;
    numValue = Math.max(min, Math.min(max, numValue));
    updateFormatting({ [key]: numValue });
  }, [updateFormatting]);
  const handleImageLoad = React.useCallback((e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setDataFile((prevDataFile) => ({
      ...prevDataFile,
      data: {
        ...prevDataFile.data,
        naturalWidth,
        naturalHeight
      }
    }));
  }, []);
  const handleFileClick = React.useCallback(() => {
    fileInputRef.current.click();
  }, []);
  const handleFileChange = React.useCallback(async (e) => {
    setErrors((prevState) => ({ ...prevState, content: false }));
    const file = e.target.files[0];
    const fileKey = `image-${Date.now()}-${file.name}`;
    await saveToIndexedDB(fileKey, file);
    dispatch(addImage({
      blockId: block.id,
      // gdfgdfgdf54-51f5d1g5d15fgd-51fg5d1f5g1d5g
      key: fileKey,
      // image-175115484-origNameSKompa
      file,
      // файл бин
      fileName: file.name
      // origNameSKompa.png
    }));
    setDataFile((prev) => ({
      ...prev,
      content: URL.createObjectURL(file),
      data: {
        ...prev.data,
        fileKey,
        // image-175115484-origNameSKompa
        fileName: file.name.split(".")[0],
        // origNameSKompa
        fileType: file.type,
        // image/png
        fileSize: Math.round(file.size / 1024) + "KB",
        // 11KB
        size: file.size
        // 12345 байт
      }
    }));
  }, [dispatch, block.id]);
  const handleAltToggle = React.useCallback(() => {
    updateFormatting({ showAlt: !formatting.showAlt });
  }, [formatting.showAlt, updateFormatting]);
  const handleAltChange = React.useCallback((e) => {
    const altValue = e.target.value;
    setErrors((prev) => ({ ...prev, alt: false }));
    setDataFile((prevDataFile) => ({
      ...prevDataFile,
      data: {
        ...prevDataFile.data,
        alt: altValue
      }
    }));
  }, []);
  const handleFileNameChange = React.useCallback((e) => {
    setErrors((prev) => ({ ...prev, fileName: false }));
    setDataFile((prevDataFile) => ({
      ...prevDataFile,
      data: {
        ...prevDataFile.data,
        fileName: e.target.value
      }
    }));
  }, []);
  const handleAlignToggle = React.useCallback((value) => () => {
    updateFormatting({ alignment: value });
  }, [updateFormatting]);
  const handleBorderToggle = React.useCallback(() => {
    if (formatting.useBorder) {
      updateFormatting({ useBorder: false });
    } else {
      updateFormatting({
        useBorder: true,
        borderWidth: DEFAULT_FORMATTING.borderWidth,
        borderStyle: DEFAULT_FORMATTING.borderStyle,
        borderColor: DEFAULT_FORMATTING.borderColor
      });
    }
  }, [formatting.useBorder, updateFormatting]);
  const handleBorderStyleChange = React.useCallback((e) => {
    updateFormatting({ borderStyle: e.target.value });
  }, [updateFormatting]);
  const handleBorderWidthChange = React.useCallback((e) => {
    handleInputChange("borderWidth", e.target.value, 1, 10);
  }, [handleInputChange]);
  const handleBorderColorChange = React.useCallback((e) => {
    updateFormatting({ borderColor: e.target.value });
  }, [updateFormatting]);
  const handleBorderRadiusToggle = React.useCallback(() => {
    if (formatting.useBorderRadius) {
      updateFormatting({ useBorderRadius: false });
    } else {
      updateFormatting({
        useBorderRadius: true,
        borderRadius: DEFAULT_FORMATTING.borderRadius
      });
    }
  }, [formatting.useBorderRadius, updateFormatting]);
  const handleBorderRadiusChange = React.useCallback((e) => {
    handleInputChange("borderRadius", e.target.value, 1, 50);
  }, [handleInputChange]);
  const handleSizeToggle = React.useCallback(() => {
    updateFormatting({
      useResize: !formatting.useResize,
      size: formatting.useResize ? void 0 : DEFAULT_FORMATTING.size
    });
  }, [formatting.useResize, updateFormatting]);
  const handleSizeChange = React.useCallback((e) => {
    handleInputChange("size", e.target.value, 10, 100);
  }, [handleInputChange]);
  const handleMarginTopToggle = React.useCallback(() => {
    updateFormatting({
      useMarginTop: !formatting.useMarginTop,
      marginTop: formatting.useMarginTop ? void 0 : DEFAULT_FORMATTING.marginTop
    });
  }, [formatting.useMarginTop, updateFormatting]);
  const handleMarginTopChange = React.useCallback((e) => {
    handleInputChange("marginTop", e.target.value, 1, 50);
  }, [handleInputChange]);
  const handleMarginBottomToggle = React.useCallback(() => {
    updateFormatting({
      useMarginBottom: !formatting.useMarginBottom,
      marginBottom: formatting.useMarginBottom ? void 0 : DEFAULT_FORMATTING.marginBottom
    });
  }, [formatting.useMarginBottom, updateFormatting]);
  const handleMarginBottomChange = React.useCallback((e) => {
    handleInputChange("marginBottom", e.target.value, 1, 50);
  }, [handleInputChange]);
  const previewStyle = React.useMemo(() => ({
    marginTop: formatting.useMarginTop ? `${formatting.marginTop ?? DEFAULT_FORMATTING.marginTop}px` : void 0,
    marginBottom: formatting.useMarginBottom ? `${formatting.marginBottom ?? DEFAULT_FORMATTING.marginBottom}px` : void 0,
    alignItems: formatting.alignment === "left" ? "flex-start" : formatting.alignment === "right" ? "flex-end" : "center",
    maxWidth: formatting.useResize ? `${formatting.size ?? DEFAULT_FORMATTING.size}%` : `${DEFAULT_FORMATTING.size}%`,
    borderStyle: () => {
      if (!formatting.useBorder) return "none";
      return `${formatting.borderWidth ?? DEFAULT_FORMATTING.borderWidth}px ${formatting.borderStyle ?? DEFAULT_FORMATTING.borderStyle} ${formatting.borderColor ?? DEFAULT_FORMATTING.borderColor}`;
    },
    borderRadius: formatting.useBorderRadius ? `${formatting.borderRadius ?? DEFAULT_FORMATTING.borderRadius}px` : "0"
  }), [formatting]);
  React.useImperativeHandle(ref, () => ({
    validate() {
      var _a, _b, _c, _d;
      const newErrors = {
        alt: !dataFile.data.alt || !dataFile.data.alt.trim(),
        fileName: !((_a = dataFile.data) == null ? void 0 : _a.fileName) || !/^[a-zA-Z0-9_-]+$/.test(dataFile.data.fileName.trim()),
        content: !dataFile.content
      };
      setErrors(newErrors);
      if (newErrors.alt) {
        (_b = altRef.current) == null ? void 0 : _b.focus();
        return false;
      }
      if (newErrors.fileName) {
        (_c = fileNameRef.current) == null ? void 0 : _c.focus();
        return false;
      }
      if (newErrors.content) {
        (_d = fileInputRef.current) == null ? void 0 : _d.focus();
        return false;
      }
      return true;
    },
    getContent: () => ({
      ...dataFile,
      formatting: { ...formatting }
    })
  }));
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__fields", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          className: "imageblock__upload-btn",
          onClick: handleFileClick,
          title: "Загрузка изображения",
          children: dataFile.content ? "Заменить изображение" : "Загрузить изображение"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          type: "file",
          ref: fileInputRef,
          accept: acceptString,
          onChange: handleFileChange,
          className: "imageblock__file-input"
        }
      ),
      errors.content && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__error", children: "Поддерживаются только JPG, PNG, WebP изображения и файлы не более 5МВ." }),
      dataFile.content && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__field", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "imageblock__label", children: "Описание изображения (alt)*" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              ref: altRef,
              type: "text",
              value: dataFile.data.alt ?? "",
              onChange: handleAltChange,
              placeholder: "Введите описание изображения",
              className: `imageblock__input ${errors.alt ? "imageblock__input--error" : ""}`
            }
          ),
          errors.alt && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__error", children: "Обязательное поле." })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__field", children: [
          /* @__PURE__ */ jsxRuntime.jsx("label", { className: "imageblock__label", children: "Имя файла (без расширения)*" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              ref: fileNameRef,
              type: "text",
              value: dataFile.data.fileName ?? "",
              onChange: handleFileNameChange,
              placeholder: "Введите имя файла",
              className: `imageblock__input ${errors.fileName ? "imageblock__input--error" : ""}`
            }
          ),
          errors.fileName && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__error", children: "Допустимы только латинские буквы, цифры, дефисы и подчёркивания." })
        ] })
      ] })
    ] }),
    showSettings && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__toolbar", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__toolbar-section", children: /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: handleAltToggle,
          className: `imageblock__format-btn ${formatting.showAlt ? "imageblock__format-btn--active" : ""}`,
          title: formatting.showAlt ? "Скрыть описание" : "Отображать описание",
          children: formatting.showAlt ? /* @__PURE__ */ jsxRuntime.jsx(md.MdOutlineSubtitles, {}) : /* @__PURE__ */ jsxRuntime.jsx(md.MdOutlineSubtitlesOff, {})
        }
      ) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__toolbar-section", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__alignment-btns", children: alignOptions.map((option) => /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: handleAlignToggle(option.value),
          className: `imageblock__format-btn ${formatting.alignment === option.value ? "imageblock__format-btn--active" : ""}`,
          title: option.title,
          children: option.icon
        },
        option.value
      )) }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__toolbar-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: handleBorderToggle,
            className: `imageblock__format-btn ${formatting.useBorder ? "imageblock__format-btn--active" : ""}`,
            title: formatting.useBorder ? "Добавить рамку" : "Убрать рамку",
            children: /* @__PURE__ */ jsxRuntime.jsx(rx.RxBorderAll, {})
          }
        ),
        formatting.useBorder && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__border-style-container", children: [
            /* @__PURE__ */ jsxRuntime.jsx(rx.RxBorderStyle, { className: "imageblock__icon" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "select",
              {
                value: formatting.borderStyle,
                onChange: handleBorderStyleChange,
                className: "imageblock__select",
                title: "Стиль линии рамки",
                children: borderStyleOptions.map((option) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: option.value, children: option.label }, option.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__input-group", children: [
            /* @__PURE__ */ jsxRuntime.jsx(bs.BsBorderWidth, { className: "imageblock__icon" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "number",
                min: "1",
                max: "10",
                value: formatting.borderWidth,
                onChange: handleBorderWidthChange,
                className: "imageblock__number-input",
                title: "Толщина рамки (1-10px)"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__color-container", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "color",
                value: formatting.borderColor,
                onChange: handleBorderColorChange,
                className: "imageblock__color-input",
                title: "Цвет рамки"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "div",
              {
                className: "imageblock__color-preview",
                style: { backgroundColor: formatting.borderColor }
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__toolbar-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: handleBorderRadiusToggle,
            className: `imageblock__format-btn ${formatting.useBorderRadius ? "imageblock__format-btn--active" : ""}`,
            title: formatting.useBorderRadius ? "Убрать скругление углов" : "Добавить скругление углов",
            children: /* @__PURE__ */ jsxRuntime.jsx(bi.BiBorderRadius, {})
          }
        ),
        formatting.useBorderRadius && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__input-group", children: /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "number",
            min: "1",
            max: "50",
            value: formatting.borderRadius,
            onChange: handleBorderRadiusChange,
            className: "imageblock__number-input",
            title: "Скругление углов (1-50px)"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__toolbar-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: handleSizeToggle,
            className: `imageblock__format-btn ${formatting.useResize ? "imageblock__format-btn--active" : ""}`,
            title: "Изменить размер изображения",
            children: /* @__PURE__ */ jsxRuntime.jsx(gi.GiResize, {})
          }
        ),
        formatting.useResize && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__input-group", children: /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "range",
            min: "10",
            max: "100",
            value: formatting.size,
            onChange: handleSizeChange,
            className: "imageblock__range",
            title: "Размер изображения (10-100%)"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__toolbar-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: handleMarginTopToggle,
            className: `imageblock__format-btn ${formatting.useMarginTop ? "imageblock__format-btn--active" : ""}`,
            title: formatting.useMarginTop ? "Убрать отступ сверху" : "Добавить отступ сверху",
            children: /* @__PURE__ */ jsxRuntime.jsx(md.MdVerticalAlignTop, {})
          }
        ),
        formatting.useMarginTop && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__input-group", children: /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "number",
            min: "1",
            max: "50",
            value: formatting.marginTop,
            onChange: handleMarginTopChange,
            className: "imageblock__number-input",
            title: "Отступ сверху (0-50px)"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__toolbar-section", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            onClick: handleMarginBottomToggle,
            className: `imageblock__format-btn ${formatting.useMarginBottom ? "imageblock__format-btn--active" : ""}`,
            title: formatting.useMarginBottom ? "Убрать отступ снизу" : "Добавить отступ снизу",
            children: /* @__PURE__ */ jsxRuntime.jsx(md.MdVerticalAlignBottom, {})
          }
        ),
        formatting.useMarginBottom && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__input-group", children: /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "number",
            min: "1",
            max: "50",
            value: formatting.marginBottom,
            onChange: handleMarginBottomChange,
            className: "imageblock__number-input",
            title: "Отступ снизу (0-50px)"
          }
        ) })
      ] })
    ] }),
    dataFile.content && /* @__PURE__ */ jsxRuntime.jsx("hr", {}),
    dataFile.content && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__preview", style: {
      paddingTop: previewStyle.marginTop,
      paddingBottom: previewStyle.marginBottom
    }, children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__preview-container", style: {
      alignItems: previewStyle.alignItems
    }, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "imageblock__img-box", style: {
      maxWidth: previewStyle.maxWidth
    }, children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "img",
        {
          src: getImageSrc(dataFile.content),
          alt: dataFile.data.alt,
          onLoad: handleImageLoad,
          className: "imageblock__image",
          style: {
            borderRadius: previewStyle.borderRadius,
            border: previewStyle.borderStyle()
          }
        }
      ),
      formatting.showAlt && dataFile.data.alt && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "imageblock__alt-text", children: dataFile.data.alt })
    ] }) }) })
  ] });
});
const ImageBlock$1 = React.memo(ImageBlock);
const BlockComponent = ({
  block,
  index,
  onDragStart,
  deleteBlock,
  blockRefs,
  onDragEnd,
  onChange
}) => {
  let Comp;
  if (block.type === "text") Comp = TextBlock$1;
  else if (block.type === "heading") Comp = HeadingBlock$1;
  else if (block.type === "image") Comp = ImageBlock$1;
  else return null;
  const [isLocalDragging, setIsLocalDragging] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const dragHandleRef = React.useRef(null);
  const handleDragStart = (e) => {
    setIsLocalDragging(true);
    onDragStart(index);
  };
  const handleDragEnd = (e) => {
    setIsLocalDragging(false);
    onDragEnd();
  };
  const handleDeleteConfirm = () => {
    deleteBlock(block.id);
    setShowDeleteModal(false);
  };
  React.useEffect(() => {
    if (dragHandleRef.current) {
      dragHandleRef.current.classList.toggle("blockcomp--dragging", isLocalDragging);
    }
  }, [isLocalDragging]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      ref: dragHandleRef,
      className: "blockcomp",
      children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "blockcomp__container", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "blockcomp__controls", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              draggable: true,
              onDragStart: handleDragStart,
              onDragEnd: handleDragEnd,
              onDragOver: (e) => e.preventDefault(),
              className: "blockcomp__drag-handle",
              title: "Переместить блок",
              children: /* @__PURE__ */ jsxRuntime.jsx(fa.FaGripLines, {})
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              onClick: () => setIsSettingsOpen(!isSettingsOpen),
              className: `blockcomp__settings-btn ${isSettingsOpen ? "blockcomp__settings-btn--active" : ""}`,
              title: isSettingsOpen ? "Скрыть настройки" : "Показать настройки",
              children: /* @__PURE__ */ jsxRuntime.jsx(io5.IoSettings, {})
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowDeleteModal(true),
              className: "blockcomp__delete-btn",
              title: "Удалить блок",
              children: /* @__PURE__ */ jsxRuntime.jsx(ri.RiDeleteBin7Fill, {})
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { id: `blockEditor-${block.id}`, className: "blockcomp__content", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            Comp,
            {
              ref: (el) => blockRefs.current[block.id] = el,
              block,
              showSettings: isSettingsOpen,
              onChange
            }
          ),
          showDeleteModal && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "blockcomp__modal-overlay", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "blockcomp__modal", children: [
            /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "blockcomp__modal-title", children: "Подтверждение удаления" }),
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "blockcomp__modal-text", children: "Вы уверены, что хотите удалить этот блок?" }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "blockcomp__modal-buttons", children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowDeleteModal(false),
                  className: "blockcomp__modal-btn blockcomp__modal-btn--cancel",
                  children: "Отмена"
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  type: "button",
                  onClick: handleDeleteConfirm,
                  className: "blockcomp__modal-btn blockcomp__modal-btn--confirm",
                  children: "Удалить"
                }
              )
            ] })
          ] }) })
        ] })
      ] })
    }
  );
};
const BlockComponent$1 = React.memo(BlockComponent);
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
const ListBlock = React.forwardRef(({ initialBlocks, onChange }, ref) => {
  const blockRefs = React.useRef({});
  const isFirstRender = React.useRef(true);
  const [blocks, setBlocks] = React.useState(initialBlocks || []);
  const [draggedIndex, setDraggedIndex] = React.useState(null);
  const [dropTarget, setDropTarget] = React.useState({ index: null, position: null });
  const [isEmptyError, setIsEmptyError] = React.useState(false);
  useDeepCompareEffect(() => {
    onChange();
  }, [blocks]);
  React.useEffect(() => {
    if (initialBlocks && JSON.stringify(initialBlocks) !== JSON.stringify(blocks)) {
      setBlocks(initialBlocks);
    }
  }, [initialBlocks]);
  React.useImperativeHandle(ref, () => ({
    validateAllBlocks() {
      if (blocks.length === 0) {
        setIsEmptyError(true);
        return false;
      }
      setIsEmptyError(false);
      return Object.entries(blockRefs.current).every(([_, blockRef]) => {
        var _a;
        return ((_a = blockRef == null ? void 0 : blockRef.validate) == null ? void 0 : _a.call(blockRef)) !== false;
      });
    },
    getAllBlocks() {
      const updatedBlocks = blocks.map((block) => {
        const blockRef = blockRefs.current[block.id];
        if (blockRef && blockRef.getContent) {
          return {
            ...block,
            ...blockRef.getContent()
          };
        }
        return block;
      });
      setBlocks(updatedBlocks);
      return updatedBlocks;
    }
  }));
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (blocks.length === 0) {
      setIsEmptyError(true);
    } else {
      setIsEmptyError(false);
    }
  }, [blocks]);
  const handleAddBlock = (index, type) => {
    const newBlock = {
      id: generateUUID(),
      type,
      content: ""
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index, 0, newBlock);
    setBlocks(newBlocks);
    setIsEmptyError(false);
  };
  const handleDeleteBlock = (id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };
  const handleDragStart = (index) => {
    setDraggedIndex(index);
    setDropTarget({ index: null, position: null });
  };
  const handleDrop = () => {
    if (draggedIndex === null || dropTarget.index === null) return;
    let adjustedDropIndex = dropTarget.position === "top" ? dropTarget.index : dropTarget.index + 1;
    if (adjustedDropIndex === draggedIndex || adjustedDropIndex === draggedIndex + 1) {
      return;
    }
    const updated = [...blocks];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(adjustedDropIndex, 0, moved);
    setBlocks(updated);
    setDraggedIndex(null);
    setDropTarget({ index: null, position: null });
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || index === draggedIndex) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? "top" : "bottom";
    setDropTarget({ index, position });
  };
  const handleDragLeave = () => {
    setDropTarget({ index: null, position: null });
  };
  const handleDragEnd = () => {
    if (draggedIndex !== null && dropTarget.index !== null) {
      dropTarget.position === "top" ? dropTarget.index : dropTarget.index + 1;
      handleDrop();
    }
    setDraggedIndex(null);
    setDropTarget({ index: null, position: null });
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      onDragEnd: handleDragEnd,
      className: "listblock__container",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "listblock__add-menu-wrapper", children: /* @__PURE__ */ jsxRuntime.jsx(AddMenu$1, { index: 0, onAdd: handleAddBlock }) }),
        isEmptyError && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "listblock__error", children: "Нельзя сохранить пустое содержимое статьи. Добавьте хотя бы один блок." }),
        blocks.map((block, index) => /* @__PURE__ */ jsxRuntime.jsxs(React.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsxs(
            "div",
            {
              className: "listblock__block-wrapper",
              onDragOver: (e) => handleDragOver(e, index),
              onDragLeave: handleDragLeave,
              children: [
                dropTarget.index === index && dropTarget.position === "top" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "listblock__drop-indicator listblock__drop-indicator--top" }),
                dropTarget.index === index && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "listblock__drop-zone" }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  BlockComponent$1,
                  {
                    block,
                    index,
                    onDragStart: handleDragStart,
                    deleteBlock: handleDeleteBlock,
                    blockRefs,
                    onDragEnd: handleDragEnd,
                    onChange
                  }
                ),
                dropTarget.index === index && dropTarget.position === "bottom" && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "listblock__drop-indicator listblock__drop-indicator--bottom" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "listblock__add-menu-wrapper", children: /* @__PURE__ */ jsxRuntime.jsx(AddMenu$1, { index: index + 1, onAdd: handleAddBlock }) })
        ] }, block.id))
      ]
    }
  );
});
const ListBlock$1 = React.memo(ListBlock);
const PostEditor = React.forwardRef(({ initState, onChange }, ref) => {
  const metaRef = React.useRef();
  const blockRef = React.useRef();
  React.useImperativeHandle(ref, () => ({
    getContent() {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const validMeta = (_b = (_a = metaRef.current) == null ? void 0 : _a.validateMeta) == null ? void 0 : _b.call(_a);
      const validBlocks = (_d = (_c = blockRef.current) == null ? void 0 : _c.validateAllBlocks) == null ? void 0 : _d.call(_c);
      if (!validMeta || !validBlocks) return false;
      const metaData = ((_f = (_e = metaRef.current) == null ? void 0 : _e.getMeta) == null ? void 0 : _f.call(_e)) || {};
      const blocksData = ((_h = (_g = blockRef.current) == null ? void 0 : _g.getAllBlocks) == null ? void 0 : _h.call(_g)) || [];
      return {
        ...initState,
        meta: metaData,
        content: blocksData
      };
    }
  }));
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posteditor-container", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      MetaBlock$1,
      {
        initialMeta: (initState == null ? void 0 : initState.meta) || {},
        onChange,
        ref: metaRef
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      ListBlock$1,
      {
        ref: blockRef,
        onChange,
        initialBlocks: (initState == null ? void 0 : initState.content) || []
      }
    )
  ] });
});
const PostEditor$1 = React.memo(PostEditor);
const fontSizeMap = {
  2: "2rem",
  3: "1.75rem",
  4: "1.5rem",
  5: "1.25rem",
  6: "1rem"
};
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
const PostView = ({ meta = {}, content = [] }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "post-view", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(reactHelmetAsync.Helmet, { children: [
      /* @__PURE__ */ jsxRuntime.jsx("meta", { name: "description", content: meta.description || "" }),
      /* @__PURE__ */ jsxRuntime.jsx("meta", { name: "keywords", content: meta.keywords || "" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "post-meta", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "post-title", children: meta.title }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "post-author-date", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "post-author", children: meta.author }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "post-date", children: formatDate(meta.date) })
      ] }),
      meta.description && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "post-description", children: meta.description }),
      meta.keywords && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "post-keywords", children: meta.keywords.split(",").map((keyword, index) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "keyword-tag", children: keyword.trim() }, index)) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "post-content", children: content == null ? void 0 : content.map((block) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R;
      if (block.type === "text") {
        const style = {
          fontWeight: ((_a = block.formatting) == null ? void 0 : _a.bold) ? "bold" : "normal",
          fontStyle: ((_b = block.formatting) == null ? void 0 : _b.italic) ? "italic" : "normal",
          textDecoration: ((_c = block.formatting) == null ? void 0 : _c.underline) ? ((_d = block.formatting) == null ? void 0 : _d.strikethrough) ? "underline line-through" : "underline" : ((_e = block.formatting) == null ? void 0 : _e.strikethrough) ? "line-through" : "none",
          color: ((_f = block.formatting) == null ? void 0 : _f.color) || "#000000",
          textAlign: ((_g = block.formatting) == null ? void 0 : _g.alignment) || "left",
          fontSize: `${((_h = block.formatting) == null ? void 0 : _h.fontSize) || 16}px`,
          marginTop: ((_i = block.formatting) == null ? void 0 : _i.useMarginTop) ? `${((_j = block.formatting) == null ? void 0 : _j.marginTop) || 0}px` : 0,
          marginBottom: ((_k = block.formatting) == null ? void 0 : _k.useMarginBottom) ? `${((_l = block.formatting) == null ? void 0 : _l.marginBottom) || 0}px` : 0,
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word"
        };
        return /* @__PURE__ */ jsxRuntime.jsx("p", { style, className: "text-block", children: block.content }, block.id);
      }
      if (block.type === "heading") {
        const HeadingTag = `h${((_m = block.formatting) == null ? void 0 : _m.level) || 2}`;
        const style = {
          textAlign: ((_n = block.formatting) == null ? void 0 : _n.alignment) || "left",
          color: ((_o = block.formatting) == null ? void 0 : _o.color) || "#000000",
          fontWeight: ((_p = block.formatting) == null ? void 0 : _p.bold) ? "bold" : "normal",
          fontStyle: ((_q = block.formatting) == null ? void 0 : _q.italic) ? "italic" : "normal",
          textDecoration: ((_r = block.formatting) == null ? void 0 : _r.underline) ? ((_s = block.formatting) == null ? void 0 : _s.strikethrough) ? "underline line-through" : "underline" : ((_t = block.formatting) == null ? void 0 : _t.strikethrough) ? "line-through" : "none",
          marginTop: ((_u = block.formatting) == null ? void 0 : _u.useMarginTop) ? `${((_v = block.formatting) == null ? void 0 : _v.marginTop) || 0}px` : 0,
          marginBottom: ((_w = block.formatting) == null ? void 0 : _w.useMarginBottom) ? `${((_x = block.formatting) == null ? void 0 : _x.marginBottom) || 15}px` : 0,
          lineHeight: "1.3"
        };
        style.fontSize = fontSizeMap[((_y = block.formatting) == null ? void 0 : _y.level) || 2] || "2rem";
        return /* @__PURE__ */ jsxRuntime.jsx(HeadingTag, { style, className: "heading-block", children: block.content }, block.id);
      }
      if (block.type === "image") {
        const imageStyle = {
          borderRadius: ((_z = block.formatting) == null ? void 0 : _z.useBorderRadius) ? `${((_A = block.formatting) == null ? void 0 : _A.borderRadius) || 0}px` : 0,
          border: ((_B = block.formatting) == null ? void 0 : _B.useBorder) ? `${((_C = block.formatting) == null ? void 0 : _C.borderWidth) || 1}px ${((_D = block.formatting) == null ? void 0 : _D.borderStyle) || "solid"} ${((_E = block.formatting) == null ? void 0 : _E.borderColor) || "#cccccc"}` : "none"
        };
        return /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: "image-block",
            style: {
              display: "flex",
              justifyContent: ((_F = block.formatting) == null ? void 0 : _F.alignment) === "left" ? "flex-start" : ((_G = block.formatting) == null ? void 0 : _G.alignment) === "right" ? "flex-end" : "center",
              marginTop: ((_H = block.formatting) == null ? void 0 : _H.useMarginTop) ? `${((_I = block.formatting) == null ? void 0 : _I.marginTop) || 0}px` : 0,
              marginBottom: ((_J = block.formatting) == null ? void 0 : _J.useMarginBottom) ? `${((_K = block.formatting) == null ? void 0 : _K.marginBottom) || 0}px` : 0
            },
            children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "image-container", style: {
              maxWidth: ((_L = block.formatting) == null ? void 0 : _L.useResize) ? `${((_M = block.formatting) == null ? void 0 : _M.size) || 100}%` : "100%",
              width: ((_N = block.formatting) == null ? void 0 : _N.useResize) ? `${((_O = block.formatting) == null ? void 0 : _O.size) || 100}%` : "100%"
            }, children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                "img",
                {
                  src: getImageSrc(block.content),
                  alt: ((_P = block.data) == null ? void 0 : _P.alt) || "",
                  style: imageStyle,
                  className: "post-image"
                }
              ),
              ((_Q = block.formatting) == null ? void 0 : _Q.showAlt) && ((_R = block.data) == null ? void 0 : _R.alt) && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "image-caption", children: block.data.alt })
            ] })
          },
          block.id
        );
      }
      if (block.type === "divider") {
        return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "divider-block", children: /* @__PURE__ */ jsxRuntime.jsx("hr", {}) }, block.id);
      }
      return null;
    }) })
  ] });
};
const PostView$1 = React.memo(PostView);
const PostsNav = ({
  mode,
  viewMode,
  onToggleMode,
  isCreateMode,
  isAuthor,
  isFav,
  onFav,
  onSave,
  isOwnerOrAdmin,
  onDelete
}) => {
  const hasUnsavedChanges = reactRedux.useSelector((state) => state.appSettings.hasUnsavedChanges);
  const isEditingOrCreating = mode === "edit" || isCreateMode;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posteditor-toolbar", children: [
    (isEditingOrCreating || isOwnerOrAdmin) && /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        className: "posteditor-toolbar__btn",
        onClick: onToggleMode,
        title: viewMode === "edit" ? "Предпросмотр" : "Редактировать",
        type: "button",
        children: viewMode === "edit" ? /* @__PURE__ */ jsxRuntime.jsx(io5.IoEyeSharp, { size: 20 }) : /* @__PURE__ */ jsxRuntime.jsx(md.MdEdit, { size: 20 })
      }
    ),
    isEditingOrCreating && /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        className: "posteditor-toolbar__btn",
        onClick: onSave,
        title: "Сохранить",
        type: "button",
        disabled: !isCreateMode && !hasUnsavedChanges,
        children: /* @__PURE__ */ jsxRuntime.jsx(io5.IoSave, { size: 20 })
      }
    ),
    !isCreateMode && (isOwnerOrAdmin || mode === "edit") && onDelete && /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        className: "posteditor-toolbar__btn",
        onClick: onDelete,
        title: "Удалить пост",
        type: "button",
        disabled: !isOwnerOrAdmin,
        children: /* @__PURE__ */ jsxRuntime.jsx(ri.RiDeleteBin7Fill, { size: 20 })
      }
    ),
    !isCreateMode && mode === "view" && onFav && !isAuthor && /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        className: "posteditor-toolbar__btn",
        onClick: onFav,
        title: isFav ? "Удалить из избранного" : "Добавить в избранное",
        type: "button",
        children: isFav ? /* @__PURE__ */ jsxRuntime.jsx(fa.FaBookmark, { size: 20 }) : /* @__PURE__ */ jsxRuntime.jsx(fa.FaRegBookmark, { size: 20 })
      }
    ),
    hasUnsavedChanges && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "posteditor-toolbar__unsaved", children: "Есть несохраненные изменения" })
  ] });
};
const PostsNav$1 = React.memo(PostsNav);
const SITE_TITLE = "Messaria";
const PostsItemPage = ({ mode: initialMode }) => {
  var _a, _b, _c, _d;
  const { id } = require$$2.useParams();
  const navigate = require$$2.useNavigate();
  const dispatch = reactRedux.useDispatch();
  const { user, isAuth, isAdmin, userFavorites } = reactRedux.useSelector((state) => state.userData);
  const post = reactRedux.useSelector((state) => state.postsData.postData);
  const statusSend = reactRedux.useSelector((state) => state.postsData.statusSend);
  const error = reactRedux.useSelector((state) => state.postsData.error);
  const statusGet = reactRedux.useSelector((state) => state.postsData.statusGet);
  const [localMode, setLocalMode] = React.useState(initialMode === "view" ? "view" : "edit");
  const [isClearing, setIsClearing] = React.useState(true);
  const [editorData, setEditorData] = React.useState(null);
  const isCreateMode = initialMode === "create";
  const isOwnerOrAdmin = isAdmin || ((_a = post == null ? void 0 : post.meta) == null ? void 0 : _a.author) === user;
  const isAuthor = ((_b = post == null ? void 0 : post.meta) == null ? void 0 : _b.author) === user;
  const postRef = React.useRef();
  const isFav = userFavorites == null ? void 0 : userFavorites.includes(Number(id));
  React.useEffect(() => {
    if (initialMode === "create") {
      setIsClearing(true);
      clearTempImages().then();
    }
  }, [initialMode]);
  React.useEffect(() => {
    if (isClearing && isCreateMode && Object.keys(post).length > 0) {
      setIsClearing(true);
      dispatch(clearPostState());
    }
  }, [initialMode, post, dispatch, isCreateMode]);
  React.useEffect(() => {
    if (isClearing && Object.keys(post).length === 0) {
      setIsClearing(false);
    }
  }, [post, isClearing]);
  React.useEffect(() => {
    var _a2;
    if (!isCreateMode && id && id !== String((_a2 = post == null ? void 0 : post.meta) == null ? void 0 : _a2.id)) {
      dispatch(clearPostState());
      dispatch(fetchPost(id));
    }
    return () => {
    };
  }, [id, isCreateMode, dispatch]);
  React.useEffect(() => {
    if (statusGet === "error") {
      dispatch(clearPostState());
      navigate(`/error?code=404&message=Пост не найден`);
    }
  }, [statusGet, error, navigate]);
  usePageTitle(
    isCreateMode ? localMode === "edit" ? `Новая статья | ${SITE_TITLE}` : `Предпросмотр новой статьи | ${SITE_TITLE}` : initialMode === "view" && ((_c = post == null ? void 0 : post.meta) == null ? void 0 : _c.title) ? `${(_d = post == null ? void 0 : post.meta) == null ? void 0 : _d.title} | ${SITE_TITLE}` : localMode === "edit" ? `Редактирование статьи #${id} | ${SITE_TITLE}` : `Предпросмотр статьи #${id} | ${SITE_TITLE}`
  );
  if ((initialMode === "edit" || initialMode === "view") && !/^\d+$/.test(id)) {
    return /* @__PURE__ */ jsxRuntime.jsx(SafeNavigate, { to: "/error", replace: true });
  }
  if (statusGet === "error" && !(post == null ? void 0 : post.meta)) {
    return /* @__PURE__ */ jsxRuntime.jsx(SafeNavigate, { to: "/error?code=404&message=Пост не найден", replace: true });
  }
  if (statusSend === "loading" || statusGet === "loading" || !isCreateMode && !(post == null ? void 0 : post.meta) || isCreateMode && isClearing) {
    return /* @__PURE__ */ jsxRuntime.jsx(LoadingSpinner, {});
  }
  const toggleMode = () => {
    var _a2, _b2;
    if (isCreateMode || initialMode === "edit") {
      const updatedPost = (_b2 = (_a2 = postRef.current) == null ? void 0 : _a2.getContent) == null ? void 0 : _b2.call(_a2);
      if (updatedPost) {
        setEditorData(updatedPost);
        isCreateMode ? dispatch(setPostData(updatedPost)) : dispatch(updatePostData(updatedPost));
        setLocalMode("view");
        return;
      }
      if (localMode === "view") setLocalMode("edit");
    } else if (initialMode === "view" && isOwnerOrAdmin) {
      navigate(`/posts/edit/${id}`);
    }
  };
  const handleSave = async () => {
    var _a2;
    try {
      const postData = ((_a2 = postRef == null ? void 0 : postRef.current) == null ? void 0 : _a2.getContent()) || editorData;
      if (postData) {
        dispatch(mergePostData(postData));
        await dispatch(savePost({
          isNew: isCreateMode
        })).unwrap();
        dispatch(setUnsavedChanges(false));
        navigate("/posts/favorites");
      }
    } catch (error2) {
      console.error("Ошибка сохранения:", error2);
      if (error2.message.includes("IMAGE_UPLOAD_FAILED")) {
        const blockId = error2.message.split(":")[1];
        alert(`Ошибка загрузки изображения для блока ${blockId}. Попробуйте снова.`);
      } else {
        alert("Ошибка сохранения поста. Попробуйте снова.");
      }
    }
  };
  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить этот пост?")) {
      try {
        await dispatch(deletePost(id)).unwrap();
        dispatch(setUnsavedChanges(false));
        navigate("/posts/favorites");
      } catch (error2) {
        console.error("Ошибка удаления:", error2);
      }
    }
  };
  const handleFavorite = async () => {
    try {
      if (isFav) {
        await dispatch(removeFavorite({ userId: user.id, postId: id })).unwrap();
      } else {
        await dispatch(addFavorite({ userId: user.id, postId: id })).unwrap();
      }
    } catch (error2) {
      console.error("Ошибка избранного:", error2);
    }
  };
  const handleOnChange = () => {
    dispatch(setUnsavedChanges(true));
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    initialMode !== "view" && /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "postsitem__title", children: isCreateMode ? localMode === "edit" ? "Новая статья" : "Предпросмотр новой статьи" : localMode === "edit" ? `Редактирование статьи #${id}` : `Предпросмотр статьи #${id}` }),
    isAuth && /* @__PURE__ */ jsxRuntime.jsx(
      PostsNav$1,
      {
        mode: initialMode,
        viewMode: localMode,
        onToggleMode: toggleMode,
        isCreateMode,
        isOwnerOrAdmin,
        isAuthor,
        isFav,
        onSave: handleSave,
        onFav: !isCreateMode ? () => handleFavorite() : null,
        onDelete: !isCreateMode && isOwnerOrAdmin ? handleDelete : null
      }
    ),
    error && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "postsitem__error", children: error }),
    localMode === "view" ? /* @__PURE__ */ jsxRuntime.jsx(
      PostView$1,
      {
        meta: post == null ? void 0 : post.meta,
        content: post == null ? void 0 : post.content
      }
    ) : /* @__PURE__ */ jsxRuntime.jsx(
      PostEditor$1,
      {
        initState: post,
        onChange: handleOnChange,
        ref: postRef
      }
    )
  ] });
};
const PostsItemPage$1 = React.memo(PostsItemPage);
const AuthLogout = () => {
  const dispatch = reactRedux.useDispatch();
  React.useEffect(() => {
    dispatch(logoutUser());
  }, [dispatch]);
  return /* @__PURE__ */ jsxRuntime.jsx(SafeNavigate, { to: "/" });
};
const data = {
  pageTitle: "Раздел в разработке",
  title: "Данный раздел находится на стадии разработки",
  description: "Мы прикладываем все усилия чтобы порадовать Вас новыми разделами =)"
};
const DevelopedPage = () => {
  const userName = reactRedux.useSelector((state) => state.userData.user);
  const isAdmin = reactRedux.useSelector((state) => state.userData.isAdmin);
  usePageTitle(`${data.pageTitle} | ${"Messaria"}`);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "dev-page__box", role: "alert", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "visually-hidden", children: data.title }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "dev-page", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "dev-page__text-box", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "dev-page__code", children: data.title }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "dev-page__description", children: data.description }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "dev-page__description", children: `Но можем по секрету сказать:` }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "dev-page__description", children: `Твой ник - ${userName} (статус: ${isAdmin ? "Админ" : "Пользователь"})` }),
      /* @__PURE__ */ jsxRuntime.jsx(
        nModules.Link,
        {
          to: "/",
          className: "dev-page__button",
          "aria-label": "Вернуться на главную страницу",
          children: "На главную"
        }
      )
    ] }) })
  ] });
};
const PostsSearchPage = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [lastSearch, setLastSearch] = React.useState("");
  const navigate = require$$2.useNavigate();
  const handleSearch = React.useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    setError("");
    setLastSearch(searchQuery);
    try {
      const response = await getApi(API_ROUTES.posts.search, {
        q: searchQuery,
        offset: 0,
        limit: 20
      });
      setSearchResults(response.data);
    } catch (err) {
      setError("Ошибка при выполнении поиска");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);
  const highlightMatches = React.useCallback((text) => {
    if (!text || !lastSearch) return { __html: text || "" };
    const words = lastSearch.split(/\s+/).filter((w) => w.length > 1).map((w) => escapeRegExp(w));
    if (words.length === 0) return { __html: text };
    let highlighted = text;
    words.forEach((word) => {
      const regex = new RegExp(`(${word})`, "gi");
      highlighted = highlighted.replace(regex, "<mark>$1</mark>");
    });
    return { __html: highlighted };
  }, [lastSearch]);
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-search-page", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-search-page__header", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "posts-search-page__title", children: "Поиск по постам" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-search-page__search-bar", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type: "text",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            onKeyDown: handleKeyDown,
            placeholder: "Введите ключевые слова...",
            className: "posts-search-page__search-input"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: handleSearch,
            className: "posts-search-page__search-button",
            disabled: isLoading,
            children: isLoading ? "Поиск..." : "Найти"
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "posts-search-page__error", children: error }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "posts-search-page__results", children: searchResults.map((post) => /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "posts-search-page__result-item",
        onClick: () => navigate(`/posts/view/${post.id}`),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "posts-search-page__result-title", children: post.title }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: "posts-search-page__result-fragment",
              dangerouslySetInnerHTML: highlightMatches(post.textFragment)
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-search-page__result-meta", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
              "Автор: ",
              post.author_username
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
              "Дата: ",
              new Date(post.created_at).toLocaleDateString()
            ] })
          ] })
        ]
      },
      post.id
    )) }),
    isLoading && /* @__PURE__ */ jsxRuntime.jsx(LoadingSpinner, {}),
    !isLoading && searchResults.length === 0 && lastSearch && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "posts-search-page__empty", children: [
      'По запросу "',
      lastSearch,
      '" ничего не найдено'
    ] })
  ] });
};
const HomePage = () => {
  const [activeTab, setActiveTab] = React.useState("featured");
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "home-page", children: [
    /* @__PURE__ */ jsxRuntime.jsx("section", { className: "hero-section", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "hero-content", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h1", { children: "Делитесь смыслами, а не просто словами" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { children: "Создавайте посты из гибких блоков — добавляйте фото, текст и заголовки." }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { children: "Находите вдохновение в работах других и собирайте свою коллекцию идей." }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "hero-actions", children: [
        /* @__PURE__ */ jsxRuntime.jsx(nModules.Link, { to: "/posts/create", className: "btn-primary", children: "Создать пост" }),
        /* @__PURE__ */ jsxRuntime.jsx(nModules.Link, { to: "/feed", className: "btn-secondary", children: "Найти вдохновение" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx("section", { className: "description-section", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "description-content", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h2", { children: "Конструктор ваших мыслей" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { children: "Наш сервис превращает создание постов в творческий процесс:" }),
      /* @__PURE__ */ jsxRuntime.jsxs("ul", { className: "features-list", children: [
        /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Комбинируйте блоки как пазл" }),
        /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Сохраняйте понравившиеся работы в избранное" }),
        /* @__PURE__ */ jsxRuntime.jsx("li", { children: "Открывайте новые темы через умный поиск" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "tagline", children: "Пишите так, как думаете — без ограничений шаблонов." })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx("section", { className: "cta-section", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "cta-content", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h2", { children: "Ваша история ждёт читателей" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { children: "Начните прямо сейчас — первый пост займёт меньше 5 минут." }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { children: "Делитесь опытом, находите единомышленников, собирайте обратную связь." }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "quote", children: '"Лучший способ научиться — начать делать" (с)' }),
      /* @__PURE__ */ jsxRuntime.jsx(nModules.Link, { to: "/posts/create", className: "btn-primary", children: "Создать первый пост" })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsxs("footer", { className: "main-footer", children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "footer-tagline", children: "Место, где мысли обретают форму" }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { children: "© 2025 Конструктор постов. Все права на идеи принадлежат их авторам." }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { className: "footer-privacy", children: '"Мы не храним ваши данные — мы помогаем вам их выразить"' })
    ] })
  ] });
};
const routeConfig = [
  {
    path: "/",
    element: /* @__PURE__ */ jsxRuntime.jsx(require$$2.Outlet, {}),
    children: [
      // App
      {
        element: /* @__PURE__ */ jsxRuntime.jsx(AppLayout$1, {}),
        ssrLoadData: () => refreshToken(),
        // Thunk
        children: [
          // Home
          {
            index: true,
            element: /* @__PURE__ */ jsxRuntime.jsx(HomePage, {})
          },
          // Auth
          {
            path: "auth",
            element: /* @__PURE__ */ jsxRuntime.jsx(AuthLayout, {}),
            children: [
              // Sign-in
              {
                path: "sign-in",
                element: /* @__PURE__ */ jsxRuntime.jsx(PageAuth, { mode: "login" })
              },
              // Sign-up
              {
                path: "sign-up",
                element: /* @__PURE__ */ jsxRuntime.jsx(PageAuth, { mode: "register" })
              },
              // Verified
              {
                path: "verified",
                element: /* @__PURE__ */ jsxRuntime.jsx(PageAuth, { mode: "verified" })
              },
              // Logout
              {
                path: "logout",
                element: /* @__PURE__ */ jsxRuntime.jsx(AuthLogout, {})
              },
              // Ошибка пути
              {
                path: "*",
                element: /* @__PURE__ */ jsxRuntime.jsx(
                  SafeNavigate,
                  {
                    to: "/auth/sign-in",
                    replace: true
                  }
                )
              }
            ]
          },
          // Feed
          {
            path: "feed",
            element: /* @__PURE__ */ jsxRuntime.jsx(FeedPage, {}),
            ssrLoadData: () => fetchFeedPosts({ page: 1 })
            // Thunk
          },
          // Posts
          {
            path: "posts",
            element: /* @__PURE__ */ jsxRuntime.jsx(PostsLayout, {}),
            children: [
              // Posts - search
              {
                path: "search",
                element: /* @__PURE__ */ jsxRuntime.jsx(PostsSearchPage, {})
              },
              // Posts - favorites
              {
                path: "favorites",
                element: /* @__PURE__ */ jsxRuntime.jsx(PostsListPage$1, {}),
                private: true,
                privateRedirectTo: "/auth/sign-in"
              },
              // Posts - view
              {
                path: "view/:id",
                element: /* @__PURE__ */ jsxRuntime.jsx(PostsItemPage$1, { mode: "view" }),
                ssrLoadData: (params) => fetchPost(params.id)
                // Thunk
              },
              // Posts - create
              {
                path: "create",
                element: /* @__PURE__ */ jsxRuntime.jsx(PostsItemPage$1, { mode: "create" }),
                private: true,
                privateRedirectTo: "/auth/sign-in"
              },
              // Posts - edit
              {
                path: "edit/:id",
                element: /* @__PURE__ */ jsxRuntime.jsx(PostsItemPage$1, { mode: "edit" }),
                ssrLoadData: (params) => fetchPost(params.id),
                // Thunk
                private: true,
                privateRedirectTo: "/auth/sign-in"
              },
              // Ошибка пути
              {
                path: "*",
                element: /* @__PURE__ */ jsxRuntime.jsx(
                  SafeNavigate,
                  {
                    to: "/posts/search",
                    replace: true
                  }
                )
              }
            ]
          },
          // User
          {
            path: "user",
            element: /* @__PURE__ */ jsxRuntime.jsx(UserLayout, {}),
            private: true,
            privateRedirectTo: "/auth/sign-in",
            children: [
              // Settings
              {
                path: "settings",
                element: /* @__PURE__ */ jsxRuntime.jsx(DevelopedPage, {})
              },
              // Ошибка пути
              {
                path: "*",
                element: /* @__PURE__ */ jsxRuntime.jsx(
                  SafeNavigate,
                  {
                    to: "/user/settings",
                    replace: true
                  }
                )
              }
            ]
          },
          // Error
          {
            path: "error",
            element: /* @__PURE__ */ jsxRuntime.jsx(ErrorPage, {})
          }
        ]
      },
      // Ошибка пути
      {
        path: "*",
        element: /* @__PURE__ */ jsxRuntime.jsx(
          SafeNavigate,
          {
            to: "/error",
            replace: true
          }
        )
      }
    ]
  }
];
function renderRoutes(routes) {
  return routes.map((route, idx) => {
    const element = route.private ? /* @__PURE__ */ jsxRuntime.jsx(ProtectedRoute, { redirectTo: route.privateRedirectTo, children: route.element }) : route.element;
    return /* @__PURE__ */ jsxRuntime.jsx(require$$2.Route, { path: route.path, element, index: route.index, children: route.children && renderRoutes(route.children) }, idx);
  });
}
function PagesRouter() {
  return /* @__PURE__ */ jsxRuntime.jsx(require$$2.Routes, { children: renderRoutes(routeConfig) });
}
function App() {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "container", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "box", children: /* @__PURE__ */ jsxRuntime.jsx(PagesRouter, {}) }) });
}
async function createApp(req, context) {
  const store = createStore({}, req);
  const helmetContext = {};
  async function loadDataForMatchedRoutes(url, store2) {
    const matchedRoutes = require$$2.matchRoutes(routeConfig, url);
    console.log("Выполняется SSR - ", url);
    const promisesFromRoutes = matchedRoutes.filter(({ route }) => route.ssrLoadData).map(({ route, params }) => {
      return store2.dispatch(route.ssrLoadData(params)).catch((error) => {
        console.error("Ошибка при загрузке данных для SSR:", error);
        return Promise.resolve();
      });
    });
    const promisesFromComponents = [];
    matchedRoutes.forEach(({ route, params }) => {
      var _a;
      const Component = (_a = route.element) == null ? void 0 : _a.type;
      if (Component && Component.fetchData) {
        promisesFromComponents.push(
          Component.fetchData(store2, params).catch((error) => {
            console.error("Ошибка при загрузке данных компонента:", error);
            return Promise.resolve();
          })
        );
      }
    });
    await Promise.all([...promisesFromRoutes, ...promisesFromComponents]);
  }
  await loadDataForMatchedRoutes(req.originalUrl, store);
  context.preloadedState = store.getState();
  context.helmetContext = helmetContext;
  return /* @__PURE__ */ jsxRuntime.jsx(SSRContext.Provider, { value: context, children: /* @__PURE__ */ jsxRuntime.jsx(reactHelmetAsync.HelmetProvider, { context: helmetContext, children: /* @__PURE__ */ jsxRuntime.jsx(reactRedux.Provider, { store, children: /* @__PURE__ */ jsxRuntime.jsx(nModules.serverExports.StaticRouter, { location: req.originalUrl, context, children: /* @__PURE__ */ jsxRuntime.jsx(App, {}) }) }) }) });
}
const SSRContext = React.createContext(null);
function useSSRContext() {
  return React.useContext(SSRContext);
}
exports.SSRContext = SSRContext;
exports.createApp = createApp;
exports.useSSRContext = useSSRContext;
//# sourceMappingURL=ssr-entry-server.js.map
