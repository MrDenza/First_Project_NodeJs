import { c as createAsyncThunk, a as createSlice, b as configureStore, r as reactExports, j as jsxRuntimeExports, R as React, u as useLocation, d as useNavigate, e as useDispatch, f as useSelector, g as useSearchParams, L as Link, O as Outlet, N as Navigate, h as Routes, i as Route, k as clientExports, P as Provider_default, B as BrowserRouter } from "./script-n-modules.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const API_ROUTES = {
  user: {
    login: "/api/user/login",
    register: "/api/user/register",
    resendVerification: "/api/user/resend-verification",
    validToken: "/api/user/validate-tokens",
    logout: "/api/user/logout"
  }
};
var define_process_env_default = {};
const isServer = typeof window === "undefined";
const API_BASE_URL = isServer ? define_process_env_default.API_BASE_URL || "http://localhost:3100" : "";
const PROXY_API_PATH = "";
const postApi = async (uri, data = {}, options = {}) => {
  const {
    accept = "application/json",
    headers = {},
    contentType
  } = options;
  const fetchHeaders = new Headers({
    Accept: accept,
    ...headers
  });
  let body;
  if (data instanceof FormData) {
    body = data;
  } else if (data instanceof Blob || data instanceof File) {
    body = data;
    if (contentType) {
      fetchHeaders.set("Content-Type", contentType);
    } else if (!fetchHeaders.has("Content-Type")) ;
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
    body = null;
  }
  const response = await fetch(`${API_BASE_URL}${PROXY_API_PATH}${uri}`, {
    method: "POST",
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
const setErrMsg = (err) => {
  return err && !isEnglishText(err) ? err : "Ошибка сервера. Попробуйте позже.";
};
const regUser = createAsyncThunk("userAuth/regUser", async (data, thunkAPI) => {
  try {
    return await postApi(API_ROUTES.user.register, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка регистрации. Попробуйте позже.");
  }
});
const loginUser = createAsyncThunk("userAuth/loginUser", async (data, thunkAPI) => {
  try {
    return await postApi(API_ROUTES.user.login, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка авторизации. Попробуйте позже.");
  }
});
const resendVerification = createAsyncThunk("userAuth/resendVerification", async (data, thunkAPI) => {
  var _a;
  try {
    const state = thunkAPI.getState();
    const tempAuthToken = ((_a = state.userAuth) == null ? void 0 : _a.tempAuthToken) || localStorage.getItem("tempAuthToken");
    if (!tempAuthToken) {
      return thunkAPI.rejectWithValue("Ошибка отправки письма активации. Авторизуйтесь снова.");
    }
    return await postApi(API_ROUTES.user.resendVerification, { tempAuthToken });
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Время сессии истекло. Авторизуйтесь снова.");
  }
});
const checkToken = createAsyncThunk("userAuth/checkToken", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const accessToken = state.userAuth.accessToken;
    if (accessToken && isTokenValid(accessToken)) {
      return { accessToken };
    }
    return await thunkAPI.dispatch(refreshToken()).unwrap();
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка авторизации. Авторизуйтесь снова.");
  }
});
const refreshToken = createAsyncThunk("userAuth/refreshToken", async (data, thunkAPI) => {
  var _a, _b;
  try {
    const state = thunkAPI.getState();
    const accessToken = ((_a = state.userAuth) == null ? void 0 : _a.accessToken) || "";
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
const logoutUser = createAsyncThunk("userAuth/logoutUser", async (_, thunkAPI) => {
  var _a;
  try {
    const state = thunkAPI.getState();
    const accessToken = ((_a = state.userAuth) == null ? void 0 : _a.accessToken) || "";
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
const initialState$1 = {
  user: "",
  // имя пользователя
  isAuth: false,
  // если пользователь успешно авторизован и активирован
  authCheckStatus: "idle",
  // состояние автоматической авторизации 'idle' | 'pending' | 'succeeded' | 'failed'
  errAuth: null,
  // ошибки
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
const userAuthSlice = createSlice({
  name: "userAuth",
  initialState: initialState$1,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload;
    },
    setAuth: (state, action) => {
      state.isAuth = action.payload;
    },
    clearError: (state, action) => {
      if (action.payload) state.errAuth = initialState$1.errAuth;
    },
    setAuthToken: (state, action) => {
      if (action.payload !== state.tempAuthToken && typeof action.payload === "string") {
        state.tempAuthToken = action.payload;
      }
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    setResendCooldown: (state, action) => {
      state.resendCooldown = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(regUser.pending, (state) => {
      state.registerStatus = "pending";
      state.resendActStatus = initialState$1.resendActStatus;
      state.loginStatus = initialState$1.loginStatus;
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
      state.errAuth = setErrMsg(bodyError);
    }).addCase(loginUser.pending, (state) => {
      state.loginStatus = "pending";
      state.resendActStatus = initialState$1.resendActStatus;
      state.registerStatus = initialState$1.registerStatus;
      state.errAuth = null;
    }).addCase(loginUser.fulfilled, (state, action) => {
      var _a, _b;
      if (action.payload.success) {
        state.loginStatus = "authenticated";
        state.isAuth = true;
        state.tempAuthToken = initialState$1.tempAuthToken;
        localStorage.removeItem("tempAuthToken");
        state.user = ((_a = action.payload.data) == null ? void 0 : _a.username) || "";
        state.accessToken = (_b = action.payload.data) == null ? void 0 : _b.accessToken;
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
        state.loginStatus = "error";
        const bodyError = ((_e = action.payload.data) == null ? void 0 : _e.errors) || ((_f = action.payload) == null ? void 0 : _f.message);
        state.errAuth = setErrMsg(bodyError);
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
      state.errAuth = setErrMsg(bodyError);
    }).addCase(checkToken.pending, (state) => {
      state.authCheckStatus = "pending";
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
      var _a, _b, _c, _d;
      if (action.payload.success) {
        state.loginStatus = "authenticated";
        state.authCheckStatus = "succeeded";
        state.isAuth = true;
        state.user = ((_a = action.payload.data) == null ? void 0 : _a.username) || "";
        if (typeof ((_b = action.payload.data) == null ? void 0 : _b.accessToken) === "string" && ((_c = action.payload.data) == null ? void 0 : _c.isNewToken)) {
          state.accessToken = (_d = action.payload.data) == null ? void 0 : _d.accessToken;
        }
      }
    }).addCase(refreshToken.rejected, (state, action) => {
      state.loginStatus = "error";
      state.authCheckStatus = "failed";
      state.isAuth = false;
      state.accessToken = null;
    }).addCase(logoutUser.fulfilled, (state) => {
      Object.assign(state, initialState$1);
      state.loginStatus = "logout";
    }).addCase(logoutUser.rejected, (state, action) => {
      var _a, _b;
      const bodyError = ((_a = action.payload.data) == null ? void 0 : _a.errors) || ((_b = action.payload) == null ? void 0 : _b.message);
      state.errAuth = setErrMsg(bodyError);
    });
  }
});
const { setUserData, setAuth, clearError, setAuthToken, authUser, setAccessToken, setResendCooldown, resetVerificationState } = userAuthSlice.actions;
const userAuthSlice$1 = userAuthSlice.reducer;
function createStore(preloadedState2 = {}, serverReq = null) {
  return configureStore({
    reducer: {
      userAuth: userAuthSlice$1
    },
    preloadedState: preloadedState2,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false,
      thunk: {
        extraArgument: { req: serverReq }
      }
    })
  });
}
const initialState = {
  username: "",
  email: "",
  password: "",
  login: ""
};
function generateErrList(err) {
  if (typeof err === "string") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "auth__error", children: err }, err);
  }
  if (React.isValidElement(err)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "auth__error", children: err });
  }
  if (Array.isArray(err)) {
    return err.map((msg) => generateErrList(msg));
  }
  if (err && typeof err === "object") {
    return Object.entries(err).flatMap(
      ([_, value]) => generateErrList(value)
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "auth__error", children: String(err) });
}
function AuthForm({ mode = "login", onSubmit, externalError, validator }) {
  const [form, setForm] = reactExports.useState(initialState);
  const [errors, setErrors] = reactExports.useState({});
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
  reactExports.useEffect(() => {
    setForm(initialState);
    setErrors({});
  }, [mode]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "auth__form", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "auth__title", children: mode === "register" ? "Регистрация" : "Авторизация" }),
    mode === "register" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth__field-box", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "username", children: "Ник пользователя" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
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
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth__field-box", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "login", children: "Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
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
    mode === "register" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth__field-box", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "email", children: "Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth__field-box", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "password", children: "Пароль" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
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
    (Object.keys(errors).length > 0 || externalError) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "auth__divider" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "auth__errors", children: [
        Object.keys(errors).length > 0 && generateErrList(errors),
        externalError && generateErrList(externalError)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "auth__button", children: mode === "register" ? "Зарегистрироваться" : "Войти" })
  ] });
}
const AuthForm$1 = reactExports.memo(AuthForm);
function UnverifiedNotice({
  onResend,
  isLoading,
  isSend,
  hasToken,
  error
}) {
  const [cooldown, setCooldown] = reactExports.useState(0);
  reactExports.useEffect(() => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth__unverified", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Аккаунт не активирован. Проверьте почту и подтвердите регистрацию." }),
    buttonState.hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "auth__error-resend", children: buttonState.hint }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
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
  const location = useLocation();
  reactExports.useEffect(() => {
    document.title = title;
  }, [location, title]);
}
const pageTitles = {
  login: "Вход в систему",
  register: "Регистрация",
  verified: "Подтверждение email"
};
const metaDescription = {
  login: "Войдите в свой аккаунт для доступа к персональным данным",
  register: "Зарегистрируйте новый аккаунт для получения полного доступа",
  verified: "Подтвердите ваш email для завершения регистрации"
};
function AuthPage({ mode }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tempAuthToken, errAuth, isAuth, registerStatus, loginStatus, resendActStatus } = useSelector((state) => state.userAuth);
  usePageTitle(`${pageTitles[mode]} | ${"Messaria"}`);
  reactExports.useEffect(() => {
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.content = metaDescription[mode];
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = metaDescription[mode];
      document.head.appendChild(meta);
    }
    const canonicalUrl = `${window.location.origin}/auth/${mode === "login" ? "sign-in" : mode === "register" ? "sign-up" : "verified"}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;
    dispatch(clearError(true));
  }, [mode, dispatch]);
  reactExports.useEffect(() => {
    if (isAuth) {
      navigate("/feed");
    } else if (loginStatus === "unactivated") {
      navigate("/auth/verified");
    }
  }, [isAuth, loginStatus]);
  reactExports.useEffect(() => {
    if (registerStatus === "registered") {
      navigate("/auth/verified");
    }
  }, [registerStatus]);
  const handleSubmit = async (data) => {
    const action = mode === "register" ? regUser(data) : loginUser(data);
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
  reactExports.useEffect(() => {
    const token = localStorage.getItem("tempAuthToken");
    if (token) dispatch(setAuthToken(token));
    if (mode === "verified" && !token) navigate("/auth/sign-in");
  }, [mode, dispatch, navigate]);
  const getSchemaMarkup = () => {
    var _a;
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": document.title,
      "description": (_a = document.querySelector('meta[name="description"]')) == null ? void 0 : _a.content,
      "url": window.location.href
    };
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("script", { type: "application/ld+json", children: JSON.stringify(getSchemaMarkup()) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "auth__container", itemScope: true, itemType: "https://schema.org/WebPage", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "visually-hidden", children: document.title }),
      (mode === "register" || mode === "login") && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { itemScope: true, itemType: "https://schema.org/Form", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        AuthForm$1,
        {
          mode,
          onSubmit: handleSubmit,
          validator: validate,
          externalError: errAuth ? errAuth : ""
        }
      ) }),
      mode === "verified" && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { itemScope: true, itemType: "https://schema.org/ConfirmAction", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        UnverifiedNotice,
        {
          onResend: handleResend,
          isLoading: resendActStatus === "pending",
          isSend: resendActStatus === "shipped",
          hasToken: !!tempAuthToken,
          error: errAuth
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
    ] })
  ] });
}
const PageAuth = reactExports.memo(AuthPage);
const icon = {
  // Лого
  logo: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { fill: "#000000", width: "58px", height: "58px", viewBox: "0 0 14 14", role: "img", focusable: "false", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 7,1 C 3.6825,1 1,3.6865 1,7.0075 1,7.675 1.114,8.311 1.309,8.9125 l 1.7885,0 0,-5.048 L 7,7.7725 10.9025,3.865 l 0,5.0475 1.7885,0 C 12.8855,8.311 13,7.675 13,7.0075 13,3.6875 10.3175,1 7,1 Z M 6.106,8.6535 4.3975,6.943 l 0,3.1755 -2.5185,0 C 2.935,11.8445 4.839,13 7,13 c 2.161,0 4.081,-1.1555 5.1225,-2.882 l -2.52,0 0,-3.1755 -1.693,1.7105 -0.894,0.895 -0.907,-0.895 -0.0025,0 z" }) }),
  // Дом
  home: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { x: "0px", y: "0px", width: "70.001px", height: "70.002px", viewBox: "0 0 70.001 70.002", children: /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M52.001,69.438h-34c-7.57,0-9.619-2.521-9.619-10.375V23.438c0-1.104,0.896-2,2-2s2,0.896,2,2v35.625c0,5.721,0.235,6.375,5.619,6.375h34c5.383,0,6.381-0.654,6.381-6.375V23.438c0-1.104,0.896-2,2-2c1.104,0,2,0.896,2,2v35.625C62.382,66.918,59.571,69.438,52.001,69.438z" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M43.382,68.438c-0.553,0-1-0.446-1-1V48.464c0-1.987-0.381-2.025-2.581-2.025h-9.599c-2.2,0-1.819,0.038-1.819,2.025v18.975c0,0.554-0.448,1-1,1c-0.553,0-1-0.446-1-1V48.464c0-3.444,0.915-4.025,3.819-4.025h9.599c2.904,0,4.581,0.581,4.581,4.025v18.975C44.382,67.992,43.934,68.438,43.382,68.438z" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2.002,29.396c-0.606,0-1.206-0.275-1.6-0.797c-0.664-0.883-0.486-2.137,0.396-2.801l33-24.833c0.883-0.664,2.137-0.487,2.801,0.396c0.664,0.883,0.487,2.137-0.396,2.801l-33,24.833C2.843,29.266,2.421,29.396,2.002,29.396z" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M68,29.396c-0.419,0-0.841-0.131-1.201-0.402l-33-24.833c-0.881-0.664-1.059-1.918-0.396-2.801c0.665-0.883,1.919-1.058,2.802-0.396l33,24.833c0.883,0.664,1.06,1.918,0.396,2.801C69.207,29.123,68.606,29.396,68,29.396z" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17.382,38.438c-0.553,0-1-0.446-1-1V26.063c0-0.311-0.046-0.604,0.201-0.793l13.03-10.063c0.438-0.336,1.019-0.253,1.354,0.185c0.336,0.438,0.421,1.066-0.018,1.402l-12.567,9.762v10.882C18.382,37.992,17.934,38.438,17.382,38.438z" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17.382,43.438c-0.553,0-1-0.446-1-1v-1c0-0.553,0.447-1,1-1c0.552,0,1,0.447,1,1v1C18.382,42.992,17.934,43.438,17.382,43.438z" }) })
  ] }) }) }),
  // Лупа
  lens: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { x: "0px", y: "0px", width: "64.738px", height: "64.738px", viewBox: "0 0 64.738 64.738", children: /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M24.5,49.333C10.991,49.333,0,38.344,0,24.834s10.991-24.5,24.5-24.5c13.51,0,24.5,10.99,24.5,24.5C49.001,38.344,38.012,49.333,24.5,49.333z M24.5,4.334C13.196,4.334,4,13.53,4,24.834c0,11.305,9.196,20.499,20.5,20.499c11.303,0,20.5-9.194,20.5-20.499C45,13.53,35.805,4.334,24.5,4.334z" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M10.017,17.25c-0.174,0-0.35-0.045-0.51-0.141c-0.475-0.281-0.631-0.896-0.349-1.37c3.201-5.39,9.08-8.738,15.342-8.738c0.553,0,1,0.447,1,1c0,0.553-0.447,1-1,1c-5.56,0-10.779,2.974-13.622,7.76C10.691,17.076,10.359,17.25,10.017,17.25z" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M7.667,25.248c-0.552,0-1-0.447-1-1c0-1.42,0.169-2.211,0.468-3.487c0.126-0.538,0.664-0.87,1.201-0.746c0.538,0.126,0.872,0.663,0.746,1.201c-0.28,1.198-0.415,1.827-0.415,3.032C8.667,24.801,8.22,25.248,7.667,25.248z" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("g", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M58.739,64.404c-1.604,0-3.108-0.623-4.244-1.756L38.354,46.505c-1.252-1.252-1.664-2.799-1.161-4.356c0.409-1.269,1.37-2.338,2.161-3.127c1.173-1.172,2.613-2.371,4.423-2.371c0.771,0,1.93,0.238,3.063,1.371l16.143,16.141c1.133,1.135,1.756,2.641,1.756,4.244c0,1.602-0.623,3.109-1.756,4.242C61.848,63.781,60.342,64.404,58.739,64.404zM40.982,43.445c0.007,0,0.06,0.094,0.199,0.232L57.323,59.82c0.756,0.754,2.073,0.754,2.83,0c0.377-0.379,0.584-0.881,0.584-1.414c0-0.535-0.207-1.037-0.586-1.416L44.012,40.85c-0.144-0.144-0.236-0.195-0.263-0.203c-0.014,0.008-0.426,0.061-1.565,1.203C41.04,42.99,40.985,43.402,40.982,43.445L40.982,43.445z" }) })
  ] }) }) }),
  // Сердце
  // heart: <svg x="0px" y="0px" width="62.68px" height="62.68px" viewBox="0 0 62.68 62.68"><g><g><g><path d="M31.404,60.02L31.404,60.02c-2.206,0-3.896-1.436-4.976-2.516C23.875,54.95,6.295,33.787,4.94,32.154C1.753,28.933,0,24.681,0,20.171c0-4.542,1.778-8.822,5.007-12.05l0.454-0.454C8.689,4.438,12.982,2.66,17.548,2.66c4.565,0,8.858,1.778,12.087,5.007c0.074,0.074,0.143,0.154,0.204,0.239c0.002,0,0.579,0.717,1.501,0.717c0.966,0,1.398-0.571,1.445-0.636c0.082-0.135,0.146-0.208,0.26-0.32c3.229-3.229,7.521-5.007,12.087-5.007s8.858,1.778,12.087,5.007l0.454,0.454c3.229,3.228,5.007,7.508,5.007,12.05c0,4.509-1.752,8.759-4.936,11.979c-1.354,1.646-18.424,22.416-21.362,25.354C35.302,58.584,33.611,60.02,31.404,60.02z M17.548,6.659c-3.498,0-6.786,1.362-9.259,3.835l-0.454,0.454C5.362,13.421,4,16.696,4,20.17s1.362,6.749,3.835,9.222c0.044,0.043,0.085,0.089,0.125,0.137c6.502,7.833,19.32,23.169,21.297,25.146c0.892,0.892,1.614,1.344,2.147,1.344c0.665,0,1.536-0.73,2.149-1.344c2.286-2.287,14.842-17.443,21.159-25.138c0.042-0.051,0.086-0.099,0.132-0.146c2.473-2.473,3.835-5.749,3.835-9.222c0-3.474-1.362-6.749-3.835-9.222l-0.454-0.454c-2.473-2.473-5.761-3.835-9.259-3.835c-3.441,0-6.684,1.32-9.143,3.72c-0.49,0.657-1.955,2.243-4.649,2.243c-2.584,0-4.154-1.648-4.612-2.207C24.264,7.992,21.008,6.659,17.548,6.659z"/></g><g><g><path d="M8.708,19.013c-0.088,0-0.178-0.012-0.267-0.036c-0.532-0.146-0.845-0.697-0.698-1.229c0.472-1.718,1.395-3.298,2.666-4.569l0.281-0.281c2.549-2.549,6.171-3.582,9.685-2.763c0.538,0.125,0.873,0.663,0.747,1.201c-0.125,0.538-0.666,0.871-1.2,0.747c-2.841-0.661-5.762,0.171-7.817,2.229l-0.281,0.281c-1.027,1.027-1.771,2.301-2.152,3.686C9.549,18.721,9.147,19.013,8.708,19.013z"/></g><g><path d="M24.632,14.604c-0.256,0-0.512-0.098-0.707-0.293c-0.335-0.335-0.7-0.643-1.086-0.917c-0.451-0.319-0.557-0.943-0.237-1.394c0.318-0.451,0.942-0.558,1.394-0.238c0.478,0.338,0.93,0.72,1.344,1.134c0.391,0.391,0.391,1.023,0,1.414C25.144,14.506,24.888,14.604,24.632,14.604z"/></g></g></g></g></svg>,
  // Блокнот
  notepad: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { x: "0px", y: "0px", width: "64px", height: "64px", viewBox: "0 0 64 64", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M59,57.068C59,60.896,55.896,64,52.068,64H11.932C8.104,64,5,60.896,5,57.068V6.932C5,3.104,8.104,0,11.932,0h40.136 C55.896,0,59,3.104,59,6.932V57.068z M55,6.932C55,5.313,53.688,4,52.068,4H11.932C10.313,4,9,5.313,9,6.932v50.136 C9,58.688,10.313,60,11.932,60h40.136C53.688,60,55,58.688,55,57.068V6.932z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19,63c-0.553,0-1-0.447-1-1V2c0-0.553,0.447-1,1-1c0.552,0,1,0.447,1,1v60C20,62.553,19.552,63,19,63z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M47.527,58H31.125c-0.553,0-1-0.447-1-1s0.447-1,1-1h16.402C49.105,56,51,54.109,51,51.184V48c0-0.553,0.447-1,1-1 s1,0.447,1,1v3.184C53,55.325,50.32,58,47.527,58z" }),
          " "
        ] }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M51.245,43.951c-0.271,0-0.521-0.102-0.71-0.29c-0.182-0.181-0.29-0.44-0.29-0.71c0-0.262,0.108-0.521,0.29-0.71 c0.369-0.36,1.04-0.37,1.408,0c0.19,0.188,0.302,0.448,0.302,0.71c0,0.27-0.11,0.52-0.29,0.71 C51.766,43.85,51.505,43.951,51.245,43.951z" }),
          " "
        ] }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M45,22.432c-0.146,0-0.295-0.032-0.432-0.099L39,19.666l-5.568,2.668c-0.31,0.15-0.677,0.128-0.968-0.055 c-0.291-0.184-0.471-0.503-0.471-0.847V2c0-0.553,0.454-1.318,1.007-1.318h12c0.553,0,0.993,0.766,0.993,1.318v19.432 c0,0.344-0.175,0.663-0.464,0.847C45.368,22.38,45.186,22.432,45,22.432z M39,17.557c0.146,0,0.292,0.033,0.43,0.099l4.563,2.188 V2.682h-10v17.162l4.571-2.188C38.7,17.59,38.854,17.557,39,17.557z" }),
        " "
      ] }),
      " "
    ] })
  ] }) }),
  // Карандаш
  pencil: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { x: "0px", y: "0px", width: "64px", height: "64px", viewBox: "0 0 64 64", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2.435,63.924c-0.524,0-1.035-0.206-1.414-0.586l-0.435-0.434c-0.494-0.494-0.694-1.209-0.529-1.889 c0.606-2.49,3.786-15.07,6.883-18.166L47.062,2.728c1.71-1.711,4.009-2.652,6.475-2.652c2.606,0,5.08,1.036,6.961,2.918 l0.435,0.435c1.79,1.789,2.901,4.265,3.05,6.792c0.158,2.686-0.732,5.143-2.509,6.918L21.349,57.26 c-3.111,3.111-15.943,6.059-18.484,6.617C2.722,63.91,2.578,63.924,2.435,63.924z M53.536,4.076c-1.396,0-2.69,0.525-3.646,1.48 L9.768,45.678c-1.455,1.455-3.673,8.178-5.156,13.686c5.608-1.381,12.461-3.483,13.909-4.932L58.645,14.31 c0.956-0.957,1.435-2.326,1.344-3.854c-0.092-1.563-0.777-3.094-1.885-4.199l-0.435-0.435 C56.543,4.696,55.075,4.076,53.536,4.076z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M56.956,18.171c-0.256,0-0.513-0.098-0.707-0.293L45.495,7.125c-0.392-0.391-0.392-1.023,0-1.414 c0.391-0.391,1.022-0.391,1.414,0l10.754,10.754c0.391,0.391,0.391,1.023,0,1.414C57.468,18.074,57.212,18.171,56.956,18.171z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M20.556,54.573c-0.256,0-0.512-0.099-0.707-0.293L9.094,43.523c-0.391-0.391-0.391-1.022,0-1.414 c0.391-0.391,1.023-0.391,1.414,0l10.755,10.757c0.391,0.391,0.391,1.022,0,1.414C21.068,54.475,20.812,54.573,20.556,54.573z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12.69,59.708c-0.256,0-0.512-0.099-0.707-0.293l-6.889-6.892c-0.391-0.391-0.391-1.022,0-1.414 c0.391-0.391,1.023-0.391,1.414,0L13.397,58c0.391,0.391,0.391,1.023,0,1.414C13.202,59.609,12.946,59.708,12.69,59.708z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M13.938,47.954c-0.256,0-0.512-0.099-0.707-0.293c-0.391-0.392-0.391-1.022,0-1.414l29.783-29.782 c0.391-0.391,1.023-0.391,1.414,0c0.391,0.391,0.391,1.023,0,1.414L14.645,47.661C14.45,47.855,14.194,47.954,13.938,47.954z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M46.615,15.276c-0.257,0-0.513-0.098-0.707-0.293c-0.392-0.391-0.392-1.023,0-1.414l3.723-3.723 c0.391-0.391,1.022-0.391,1.414,0c0.391,0.391,0.391,1.023,0,1.414l-3.724,3.723C47.127,15.178,46.871,15.276,46.615,15.276z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M17.247,51.262c-0.256,0-0.512-0.098-0.707-0.293c-0.391-0.391-0.391-1.023,0-1.414l36.399-36.398 c0.392-0.391,1.023-0.391,1.414,0c0.392,0.391,0.392,1.023,0,1.414L17.954,50.969C17.758,51.165,17.502,51.262,17.247,51.262z" }),
        " "
      ] }),
      " "
    ] })
  ] }) }),
  // Сообщение
  // msg: <svg x="0px" y="0px" width="65.001px" height="65.001px" viewBox="0 0 65.001 65.001"><g> <g> <g> <path d="M65,51.068c0,3.828-3.104,6.933-6.932,6.933H6.932C3.104,58.001,0,54.896,0,51.068V13.932C0,10.104,3.104,7,6.932,7 h51.136c3.828,0,6.933,3.104,6.933,6.932L65,51.068L65,51.068z M61,13.932C61,12.313,59.688,11,58.068,11H6.932 C5.313,11,4,12.313,4,13.932v37.136c0,1.619,1.313,2.933,2.932,2.933h51.136c1.619,0,2.933-1.313,2.933-2.933L61,13.932 L61,13.932z"/> </g> <g> <g> <path d="M31.659,38.432c-0.224,0-0.447-0.076-0.632-0.225l-16.765-13.65c-0.428-0.349-0.492-0.979-0.144-1.407 c0.348-0.426,0.979-0.493,1.407-0.144l16.14,13.141l15.748-12.541c0.435-0.345,1.063-0.272,1.405,0.159 c0.344,0.433,0.271,1.062-0.159,1.405L32.282,38.213C32.1,38.359,31.88,38.432,31.659,38.432z"/> </g> <g> <path d="M17.159,42.682c-0.226,0-0.452-0.076-0.64-0.231c-0.424-0.354-0.481-0.984-0.127-1.408l0.438-0.522 c0.353-0.425,0.982-0.482,1.408-0.127c0.424,0.354,0.481,0.983,0.127,1.407l-0.438,0.523 C17.73,42.561,17.446,42.682,17.159,42.682z"/> </g> <g> <path d="M19.713,39.622c-0.236,0-0.474-0.082-0.664-0.252c-0.413-0.367-0.45-0.998-0.084-1.412l5.625-6.336 c0.368-0.414,0.999-0.45,1.412-0.084c0.413,0.367,0.45,0.999,0.084,1.412l-5.625,6.336 C20.263,39.508,19.988,39.622,19.713,39.622z"/> </g> <g> <path d="M44.717,41.477c-0.285,0-0.57-0.123-0.769-0.358l-6.017-7.195c-0.354-0.424-0.298-1.054,0.127-1.409 c0.426-0.354,1.055-0.297,1.408,0.126l6.016,7.195c0.354,0.424,0.299,1.056-0.125,1.41C45.17,41.4,44.941,41.477,44.717,41.477z "/> </g> </g> </g></g></svg>,
  // Выход
  quit: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { x: "0px", y: "0px", width: "65.994px", height: "65.994px", viewBox: "0 0 65.994 65.994", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M33.753,50.937c-5.351,0-10.35-2.052-14.076-5.776l-0.658-0.658c-3.777-3.778-5.829-8.849-5.776-14.278 c0.053-5.392,2.17-10.448,5.96-14.237L29.48,5.707c0.75-0.75,2.078-0.75,2.828,0L58.472,31.87 c0.375,0.375,0.586,0.884,0.586,1.414s-0.211,1.04-0.586,1.415L48.193,44.976C44.351,48.82,39.222,50.937,33.753,50.937z M30.895,9.95l-8.863,8.863c-3.045,3.045-4.745,7.111-4.788,11.449c-0.042,4.346,1.593,8.398,4.605,11.411l0.658,0.658 c2.97,2.97,6.964,4.604,11.247,4.604c4.399,0,8.523-1.7,11.613-4.789l8.862-8.863L30.895,9.95z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M25.359,22.142c-0.256,0-0.513-0.098-0.708-0.293c-0.39-0.391-0.39-1.023,0.001-1.414l0.707-0.707 c0.391-0.391,1.024-0.391,1.415,0c0.39,0.392,0.39,1.024-0.001,1.414l-0.707,0.707C25.872,22.044,25.616,22.142,25.359,22.142z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22.17,34.815c-0.445,0-0.852-0.299-0.968-0.75c-0.964-3.733-0.402-7.773,1.541-11.083 c0.279-0.476,0.892-0.637,1.368-0.355c0.477,0.279,0.636,0.893,0.356,1.368c-1.677,2.856-2.161,6.345-1.329,9.57 c0.139,0.535-0.184,1.08-0.718,1.219C22.337,34.807,22.253,34.815,22.17,34.815z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3.816,65.994c-0.103,0-0.208-0.008-0.313-0.024c-1.089-0.172-1.834-1.19-1.664-2.281 c0.063-0.408,1.644-10.062,8.861-13.604c5.075-2.488,6.701-8.313,6.717-8.371c0.287-1.063,1.383-1.698,2.447-1.413 c1.065,0.283,1.7,1.372,1.42,2.438c-0.082,0.311-2.076,7.631-8.822,10.938c-5.336,2.617-6.66,10.55-6.673,10.631 C5.633,65.292,4.784,65.994,3.816,65.994z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M37.966,16.192c-0.512,0-1.023-0.194-1.414-0.586c-0.781-0.78-0.781-2.047,0-2.827L48.744,0.586 c0.779-0.781,2.048-0.781,2.828,0s0.78,2.047,0,2.828L39.38,15.606C38.99,15.997,38.477,16.192,37.966,16.192z" }),
          " "
        ] }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M49.985,28.213c-0.512,0-1.022-0.195-1.413-0.586c-0.781-0.781-0.781-2.047,0-2.828l12.192-12.192 c0.78-0.78,2.048-0.78,2.828,0c0.781,0.781,0.781,2.048,0,2.828L51.399,27.627C51.011,28.018,50.498,28.213,49.985,28.213z" }),
          " "
        ] }),
        " "
      ] })
    ] })
  ] }) }),
  // Пользователь
  user: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { x: "0px", y: "0px", width: "66.949px", height: "66.949px", viewBox: "0 0 66.949 66.949", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M33.558,42.628c-9.49,0-16.428-17.231-16.428-26.2C17.129,7.369,24.499,0,33.558,0c9.059,0,16.428,7.369,16.428,16.428 C49.985,25.396,43.048,42.628,33.558,42.628z M33.558,4c-6.853,0-12.428,5.575-12.428,12.428c0,7.764,6.388,22.2,12.428,22.2 c6.039,0,12.428-14.437,12.428-22.2C45.985,9.575,40.411,4,33.558,4z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M25.163,17.899c-0.553,0-1-0.447-1-1c0-5.499,4.474-9.973,9.973-9.973c0.552,0,1,0.448,1,1c0,0.553-0.448,1-1,1 c-4.396,0-7.973,3.577-7.973,7.973C26.163,17.452,25.715,17.899,25.163,17.899z" }),
          " "
        ] }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M25.514,21.738c-0.27,0-0.52-0.1-0.71-0.29c-0.189-0.189-0.29-0.45-0.29-0.71c0-0.26,0.101-0.52,0.29-0.71 c0.37-0.37,1.04-0.37,1.41,0c0.19,0.19,0.3,0.45,0.3,0.71c0,0.271-0.109,0.521-0.3,0.71 C26.035,21.639,25.774,21.738,25.514,21.738z" }),
          " "
        ] }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M33.475,66.949c-5.649,0-24.083-0.577-24.083-8c0-10.635,7.018-20.227,17.066-23.326l1.225-0.378l0.855,0.955 c3.062,3.42,6.725,3.581,10.01-0.065l0.861-0.957l1.227,0.387c9.963,3.145,16.922,12.761,16.922,23.386 C57.558,66.372,39.124,66.949,33.475,66.949z M26.502,39.834c-7.777,2.934-13.111,10.625-13.111,19.115c0,1.102,6.175,4,20.083,4 c13.907,0,20.083-2.898,20.083-4c0-8.486-5.283-16.199-12.986-19.17c-2.141,2-4.543,3.049-7.014,3.049 C31.03,42.828,28.614,41.799,26.502,39.834z" }),
        " "
      ] }),
      " "
    ] })
  ] }) }),
  // Ошибка
  error: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { x: "0px", y: "0px", width: "66.109px", height: "66.109px", viewBox: "0 0 66.109 66.109", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M52.311,66.109c-0.005,0-0.013,0-0.02,0H13.346c-0.621,0-1.207-0.289-1.586-0.781c-0.378-0.492-0.507-1.133-0.347-1.732 c0.55-2.065,13.49-50.68,15.78-57.185C28.162,3.659,29.792,0,32.755,0c2.94,0,4.552,3.597,5.508,6.303 c2.405,6.803,14.717,52.655,15.89,57.024c0.103,0.24,0.158,0.506,0.158,0.783C54.311,65.215,53.416,66.109,52.311,66.109z M15.95,62.109h33.733c-2.757-10.248-13.088-48.524-15.19-54.474c-0.789-2.231-1.424-3.138-1.737-3.482 c-0.321,0.35-0.975,1.277-1.787,3.586C29.021,13.267,18.696,51.824,15.95,62.109z" }),
          " "
        ] }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M59.055,66.109h-52c-1.104,0-2-0.895-2-2c0-1.104,0.896-2,2-2h52c1.104,0,2,0.896,2,2 C61.055,65.215,60.158,66.109,59.055,66.109z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M48.055,53.109h-32c-0.553,0-1-0.447-1-1s0.447-1,1-1h32c0.553,0,1,0.447,1,1S48.607,53.109,48.055,53.109z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M45.055,38.109h-7c-0.553,0-1-0.447-1-1s0.447-1,1-1h7c0.553,0,1,0.447,1,1S45.607,38.109,45.055,38.109z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M34.054,38.109h-14c-0.553,0-1-0.447-1-1s0.447-1,1-1h14c0.553,0,1,0.447,1,1S34.606,38.109,34.054,38.109z" }),
        " "
      ] }),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M41.055,23.109h-16c-0.553,0-1-0.447-1-1c0-0.553,0.447-1,1-1h16c0.553,0,1,0.447,1,1 C42.055,22.662,41.607,23.109,41.055,23.109z" }),
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
  const [searchParams] = useSearchParams();
  const errorCode = sanitizeText(searchParams.get("code")) || "404";
  const customMessage = searchParams.get("message");
  const { title, description } = errorMessages[errorCode] || errorMessages["404"];
  const safeCustomMessage = customMessage ? sanitizeText(decodeURIComponent(customMessage)) : null;
  usePageTitle(`${title} | ${"Messaria"}`);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "error-page__box", role: "alert", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "visually-hidden", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("script", { type: "application/ld+json", children: `{
                  "@context": "https://schema.org",
                  "@type": "ErrorPage",
                  "name": "${title}",
                  "description": "${safeCustomMessage || description}"
                }` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "error-page", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-page__icon", "aria-hidden": "true", children: icon.error || "⚠️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "error-page__text-box", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "error-page__code", children: [
          "Ошибка ",
          errorCode
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "error-page__description", children: safeCustomMessage || description }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
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
const AppNavbar = ({ isAuth, logout }) => {
  const location = useLocation();
  const navItems = [
    { path: "/feed", icon: icon.home, label: "Главная" },
    { path: "/news/search", icon: icon.lens, label: "Поиск новостей" },
    ...isAuth ? [
      { path: "/news/favorites", icon: icon.notepad, label: "Избранное" },
      { path: "/news/create", icon: icon.pencil, label: "Создать новость" }
    ] : []
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "appnavbar__container", "aria-label": "Основная навигация", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "appnavbar__link-logo", "aria-label": "На главную", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "img", "aria-hidden": "true", children: icon.logo }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "appnavbar__user-btn-box", children: navItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: item.path,
        "aria-current": location.pathname === item.path ? "page" : void 0,
        title: item.label,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "img", "aria-label": item.label, children: item.icon })
      }
    ) }, item.path)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "appnavbar__user-box", children: isAuth ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/auth/logout",
          className: "appnavbar__btn-quit",
          onClick: logout,
          title: "Выйти",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "img", "aria-label": "Выйти", children: icon.quit })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/user/settings",
          className: "appnavbar__btn-user",
          title: "Настройки профиля",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "img", "aria-label": "Профиль", children: icon.user })
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/auth/sign-in",
        className: "appnavbar__btn-user",
        title: "Войти",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { role: "img", "aria-label": "Войти", children: icon.user })
      }
    ) })
  ] });
};
const AppNavbar$1 = reactExports.memo(AppNavbar);
const AppLayout = () => {
  const dispatch = useDispatch();
  const { isAuth, authCheckStatus } = useSelector((state) => state.userAuth);
  reactExports.useEffect(() => {
    let interval;
    let isMounted = true;
    const startInterval = () => {
      if (isMounted && isAuth && authCheckStatus !== "logout") {
        interval = setInterval(() => {
          console.log("проверка");
          dispatch(checkToken());
        }, 10 * 1e3);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "applayout__container", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "applayout__nav", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AppNavbar$1, { isAuth, logout }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "applayout__main", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] });
};
const AppLayout$1 = reactExports.memo(AppLayout);
const NewsListPage = ({ mode }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: mode });
};
const NewsItemPage = ({ mode }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: mode });
};
const FeedPage = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Feed" });
};
const NewsLayout = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
};
const UserLayout = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
};
const UserSettingsPage = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "user set" });
};
const AuthLayout = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "authlayout__main", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
};
const routeConfig = [
  {
    path: "/",
    element: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    children: [
      // App
      {
        element: /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout$1, {}),
        ssrLoadData: () => refreshToken(),
        // Thunk
        children: [
          // Home
          {
            index: true,
            element: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "home" })
          },
          // Auth
          {
            path: "auth",
            element: /* @__PURE__ */ jsxRuntimeExports.jsx(AuthLayout, {}),
            children: [
              // Sign-in
              {
                path: "sign-in",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(PageAuth, { mode: "login" })
              },
              // Sign-up
              {
                path: "sign-up",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(PageAuth, { mode: "register" })
              },
              // Verified
              {
                path: "verified",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(PageAuth, { mode: "verified" })
              },
              // Ошибка пути
              {
                path: "*",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(SafeNavigate, { to: "/auth/sign-in", replace: true })
              }
            ]
          },
          // Feed
          {
            path: "feed",
            element: /* @__PURE__ */ jsxRuntimeExports.jsx(FeedPage, {})
          },
          // News
          {
            path: "news",
            element: /* @__PURE__ */ jsxRuntimeExports.jsx(NewsLayout, {}),
            children: [
              // Posts - search
              {
                path: "search",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(NewsListPage, { mode: "search" })
              },
              // Posts - favorites
              {
                path: "favorites",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(NewsListPage, { mode: "favorites" }),
                private: true,
                privateRedirectTo: "/auth/sign-in"
              },
              // Posts - view
              {
                path: "view/:id(\\d+)",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(NewsItemPage, { mode: "view" })
              },
              // Posts - create
              {
                path: "create",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(NewsItemPage, { mode: "create" }),
                private: true,
                privateRedirectTo: "/auth/sign-in"
              },
              // Posts - edit
              {
                path: "edit/:id(\\d+)",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(NewsItemPage, { mode: "edit" }),
                private: true,
                privateRedirectTo: "/auth/sign-in"
              },
              // Ошибка пути
              {
                path: "*",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(SafeNavigate, { to: "/news/search", replace: true })
              }
            ]
          },
          // User
          {
            path: "user",
            element: /* @__PURE__ */ jsxRuntimeExports.jsx(UserLayout, {}),
            private: true,
            privateRedirectTo: "/auth/sign-in",
            children: [
              // Settings
              {
                path: "settings",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(UserSettingsPage, {})
              },
              // Ошибка пути
              {
                path: "*",
                element: /* @__PURE__ */ jsxRuntimeExports.jsx(SafeNavigate, { to: "/user/settings", replace: true })
              }
            ]
          },
          // Error
          {
            path: "error",
            element: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorPage, {})
          }
        ]
      },
      // Ошибка пути
      {
        path: "*",
        element: /* @__PURE__ */ jsxRuntimeExports.jsx(SafeNavigate, { to: "/error", replace: true })
      }
    ]
  }
];
const SSRContext = reactExports.createContext(null);
function useSSRContext() {
  return reactExports.useContext(SSRContext);
}
function SafeNavigate({ to }) {
  const context = useSSRContext();
  if (typeof window === "undefined") {
    context.url = to;
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to, replace: true });
}
const LoadingSpinner = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading-spinner", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spinner" }) });
const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuth, accessToken, authCheckStatus } = useSelector((state) => state.userAuth);
  reactExports.useEffect(() => {
    if (accessToken) {
      dispatch(checkToken());
    }
  }, [dispatch, accessToken]);
  if (authCheckStatus === "idle" || authCheckStatus === "pending") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { fullScreen: true });
  }
  if (authCheckStatus === "failed" || !isAuth) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SafeNavigate, { to: "/auth/sign-in", replace: true });
  }
  return children;
};
function renderRoutes(routes) {
  return routes.map((route, idx) => {
    const element = route.private ? /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { redirectTo: route.privateRedirectTo, children: route.element }) : route.element;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: route.path, element, index: route.index, children: route.children && renderRoutes(route.children) }, idx);
  });
}
function PagesRouter() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Routes, { children: renderRoutes(routeConfig) });
}
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "box", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PagesRouter, {}) }) });
}
const init100vh = () => {
  const setHeight = () => {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };
  setHeight();
  window.addEventListener("resize", setHeight);
};
const preloadedState = window.__PRELOADED_STATE__;
delete window.__PRELOADED_STATE__;
const store = createStore(preloadedState);
if (typeof window !== "undefined") {
  init100vh();
}
const RootApp = () => /* @__PURE__ */ jsxRuntimeExports.jsx(Provider_default, { store, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrowserRouter, { future: { v7_startTransition: true, v7_relativeSplatPath: true }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) }) });
{
  clientExports.hydrateRoot(document.getElementById("root"), /* @__PURE__ */ jsxRuntimeExports.jsx(RootApp, {}));
}
//# sourceMappingURL=script-main.js.map
