import { c as createAsyncThunk, a as createSlice, b as configureStore, r as reactExports, j as jsxRuntimeExports, R as React, u as useNavigate, d as useDispatch, e as useSelector, f as useSearchParams, L as Link, O as Outlet, N as Navigate, g as Routes, h as Route, i as clientExports, P as Provider_default, B as BrowserRouter } from "./script-n-modules.js";
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
    validToken: "/api/user/validate-tokens"
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
  console.log("Ответ запроса", responseBody);
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
const regUser = createAsyncThunk("userData/regUser", async (data, thunkAPI) => {
  try {
    return await postApi(API_ROUTES.user.register, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка регистрации. Попробуйте позже.");
  }
});
const loginUser = createAsyncThunk("userData/loginUser", async (data, thunkAPI) => {
  try {
    return await postApi(API_ROUTES.user.login, data);
  } catch (err) {
    return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка авторизации. Попробуйте позже.");
  }
});
const resendVerification = createAsyncThunk("userData/resendVerification", async (data, thunkAPI) => {
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
const checkAuth = createAsyncThunk("userData/checkAuth", async (data, thunkAPI) => {
  var _a, _b;
  try {
    const state = thunkAPI.getState();
    const clientAccessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";
    const accessToken = ((_a = state.userData) == null ? void 0 : _a.accessToken) || clientAccessToken;
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
const initialState$1 = {
  user: "",
  // имя пользователя
  isAuth: false,
  // если пользователь успешно авторизован и активирован
  errAuth: null,
  // ошибки
  registerStatus: "idle",
  // состояние запроса regUser: 'idle' | 'pending' | 'registered' | 'error'
  resendActStatus: "idle",
  // состояние запроса resendVerification: 'idle' | 'pending' | 'shipped' | 'error'
  loginStatus: "idle",
  // состояние запроса loginUser: 'idle' | 'pending' | 'authenticated' | 'unactivated' | 'error'
  tempAuthToken: null,
  // временный токен для отправки активации
  accessToken: null
  // токен доступа - даётся в статусе authenticated
};
const userDataSlice = createSlice({
  name: "userData",
  initialState: initialState$1,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload;
    },
    setUserIsAuth: (state, action) => {
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
      state.errAuth = bodyError || "Ошибка сервера. Попробуйте позже.";
    }).addCase(loginUser.pending, (state) => {
      state.loginStatus = "pending";
      state.resendActStatus = initialState$1.resendActStatus;
      state.registerStatus = initialState$1.registerStatus;
      state.errAuth = null;
    }).addCase(loginUser.fulfilled, (state, action) => {
      var _a, _b, _c, _d;
      if (action.payload.success) {
        state.loginStatus = "authenticated";
        state.isAuth = true;
        state.tempAuthToken = initialState$1.tempAuthToken;
        localStorage.removeItem("tempAuthToken");
        state.user = ((_a = action.payload.data) == null ? void 0 : _a.username) || "";
        if (typeof ((_b = action.payload.data) == null ? void 0 : _b.accessToken) === "string") {
          state.accessToken = (_c = action.payload.data) == null ? void 0 : _c.accessToken;
          localStorage.setItem("accessToken", (_d = action.payload.data) == null ? void 0 : _d.accessToken);
        }
      }
    }).addCase(loginUser.rejected, (state, action) => {
      var _a, _b, _c, _d, _e, _f, _g;
      if (((_a = action.payload) == null ? void 0 : _a.code) === "ACCOUNT_NOT_ACTIVATED") {
        console.log((_b = action.payload.data) == null ? void 0 : _b.tempAuthToken);
        state.loginStatus = "unactivated";
        if (typeof ((_c = action.payload.data) == null ? void 0 : _c.tempAuthToken) === "string") {
          state.tempAuthToken = (_d = action.payload.data) == null ? void 0 : _d.tempAuthToken;
          localStorage.setItem("tempAuthToken", (_e = action.payload.data) == null ? void 0 : _e.tempAuthToken);
        }
      } else {
        state.loginStatus = "error";
        const bodyError = ((_f = action.payload.data) == null ? void 0 : _f.errors) || ((_g = action.payload) == null ? void 0 : _g.message);
        state.errAuth = bodyError || "Ошибка сервера. Попробуйте позже.";
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
      state.errAuth = bodyError || "Ошибка сервера. Попробуйте позже.";
    }).addCase(checkAuth.pending, (state) => {
      state.errAuth = null;
    }).addCase(checkAuth.fulfilled, (state, action) => {
      var _a, _b, _c, _d, _e;
      if (action.payload.success) {
        state.loginStatus = "authenticated";
        state.isAuth = true;
        state.user = ((_a = action.payload.data) == null ? void 0 : _a.username) || "";
        if (typeof ((_b = action.payload.data) == null ? void 0 : _b.accessToken) === "string" && ((_c = action.payload.data) == null ? void 0 : _c.isNewToken)) {
          state.accessToken = (_d = action.payload.data) == null ? void 0 : _d.accessToken;
          if (typeof window !== "undefined") localStorage.setItem("accessToken", (_e = action.payload.data) == null ? void 0 : _e.accessToken);
        }
      }
    }).addCase(checkAuth.rejected, (state, action) => {
      var _a, _b;
      state.loginStatus = "error";
      state.isAuth = false;
      state.accessToken = null;
      if (typeof window !== "undefined") localStorage.removeItem("accessToken");
      const bodyError = ((_a = action.payload.data) == null ? void 0 : _a.errors) || ((_b = action.payload) == null ? void 0 : _b.message);
      state.errAuth = bodyError || "Ошибка сервера. Попробуйте позже.";
    });
  }
});
const { setUserData, setUserIsAuth, clearError, setAuthToken, setResendCooldown, resetVerificationState } = userDataSlice.actions;
const userDataSlice$1 = userDataSlice.reducer;
function createStore(preloadedState2 = {}, serverReq = null) {
  return configureStore({
    reducer: {
      userData: userDataSlice$1
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
const CLIENT_ROUTES = {
  all: "*",
  auth: {
    base: "/auth",
    login: "/auth/sign-in",
    register: "/auth/sign-up",
    verified: "/auth/verified"
  },
  app: {
    home: "/messaria"
  },
  error: "/error"
};
function PageAuth({ mode }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tempAuthToken, errAuth, isAuth, registerStatus, loginStatus, resendActStatus } = useSelector((state) => state.userData);
  reactExports.useEffect(() => {
    if (isAuth) {
      navigate(CLIENT_ROUTES.app.home);
    } else if (loginStatus === "unactivated") {
      navigate(CLIENT_ROUTES.auth.verified);
    }
  }, [isAuth, loginStatus]);
  reactExports.useEffect(() => {
    if (registerStatus === "registered") {
      navigate(CLIENT_ROUTES.auth.verified);
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
        to = CLIENT_ROUTES.auth.login;
        break;
      case "login":
        to = CLIENT_ROUTES.auth.register;
        break;
      case "verified":
        to = CLIENT_ROUTES.auth.login;
        break;
    }
    navigate(to);
  };
  reactExports.useEffect(() => {
    const token = localStorage.getItem("tempAuthToken");
    if (token) dispatch(setAuthToken(token));
    if (mode === "verified" && !token) navigate(CLIENT_ROUTES.auth.login);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth__container", children: [
    (mode === "register" || mode === "login") && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AuthForm$1,
      {
        mode,
        onSubmit: handleSubmit,
        validator: validate,
        externalError: errAuth ? errAuth : ""
      }
    ),
    mode === "verified" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      UnverifiedNotice,
      {
        onResend: handleResend,
        isLoading: resendActStatus === "pending",
        isSend: resendActStatus === "shipped",
        hasToken: !!tempAuthToken,
        error: errAuth
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "auth__button",
        onClick: () => handleSwitchMode(),
        children: [
          mode === "register" && "Уже есть аккаунт? Войти",
          mode === "login" && "Нет аккаунта? Зарегистрироваться",
          mode === "verified" && "Подтвердил почту? Авторизация"
        ]
      }
    )
  ] });
}
const PageAuth$1 = reactExports.memo(PageAuth);
const ErrorPage = () => {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get("code") || "400";
  const errorMessage = searchParams.get("message") || "Произошла ошибка";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "error-page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { children: [
      "Ошибка ",
      errorCode
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: decodeURIComponent(errorMessage) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", children: "Вернуться на главную" })
  ] });
};
const MessariaPage = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "error-page", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Добро пожаловать" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/messaria", children: "тык" })
  ] });
};
function relativePath(fullPath, basePath) {
  if (basePath === void 0) {
    return fullPath.replace(/^\//, "");
  } else {
    if (fullPath.startsWith(basePath)) {
      return fullPath.slice(basePath.length).replace(/^\//, "");
    }
    return fullPath;
  }
}
const routeConfig = [
  {
    path: CLIENT_ROUTES.all,
    element: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    children: [
      {
        path: relativePath(CLIENT_ROUTES.auth.base),
        element: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
        children: [
          {
            path: relativePath(CLIENT_ROUTES.auth.login, CLIENT_ROUTES.auth.base),
            element: /* @__PURE__ */ jsxRuntimeExports.jsx(PageAuth$1, { mode: "login" })
          },
          {
            path: relativePath(CLIENT_ROUTES.auth.register, CLIENT_ROUTES.auth.base),
            element: /* @__PURE__ */ jsxRuntimeExports.jsx(PageAuth$1, { mode: "register" })
          },
          {
            path: relativePath(CLIENT_ROUTES.auth.verified, CLIENT_ROUTES.auth.base),
            element: /* @__PURE__ */ jsxRuntimeExports.jsx(PageAuth$1, { mode: "verified" })
          }
        ]
      },
      {
        path: relativePath(CLIENT_ROUTES.app.home),
        element: /* @__PURE__ */ jsxRuntimeExports.jsx(MessariaPage, {}),
        private: true,
        privateRedirectTo: CLIENT_ROUTES.auth.login,
        ssrLoadData: () => checkAuth()
        // Thunk
      },
      {
        path: relativePath(CLIENT_ROUTES.error),
        element: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorPage, {})
      },
      {
        path: CLIENT_ROUTES.all,
        // любая ошибочная страница отправляет на авторизацию
        element: /* @__PURE__ */ jsxRuntimeExports.jsx(SafeNavigate, { to: CLIENT_ROUTES.auth.login, replace: true })
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
const ProtectedRoute = ({ children, redirectTo }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuth, accessToken } = useSelector((state) => state.userData);
  const didInit = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      if (accessToken) return;
    }
    if (!isAuth) {
      dispatch(checkAuth()).unwrap().catch(() => navigate(redirectTo, { replace: true }));
    }
  }, [isAuth, dispatch, navigate, accessToken]);
  return isAuth ? children : /* @__PURE__ */ jsxRuntimeExports.jsx(SafeNavigate, { to: redirectTo });
};
function renderRoutes(routes) {
  return routes.map((route, idx) => {
    const element = route.private ? /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { redirectTo: route.privateRedirectTo, children: route.element }) : route.element;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: route.path, element, children: route.children && renderRoutes(route.children) }, idx);
  });
}
function PagesRouter() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Routes, { children: renderRoutes(routeConfig) });
}
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "app__box", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PagesRouter, {}) }) });
}
const syncAuthState = (state) => {
  var _a;
  if ((_a = state == null ? void 0 : state.userData) == null ? void 0 : _a.accessToken) {
    localStorage.setItem("accessToken", state.userData.accessToken);
  }
};
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
  syncAuthState(preloadedState);
  init100vh();
}
const RootApp = () => /* @__PURE__ */ jsxRuntimeExports.jsx(Provider_default, { store, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrowserRouter, { future: { v7_startTransition: true, v7_relativeSplatPath: true }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) }) });
{
  clientExports.hydrateRoot(document.getElementById("root"), /* @__PURE__ */ jsxRuntimeExports.jsx(RootApp, {}));
}
//# sourceMappingURL=script-main.js.map
