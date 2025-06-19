import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_ROUTES } from "../../../constants/apiRoutes";
import { postApi } from "../../../utils/postApi";

export const regUser = createAsyncThunk("userData/regUser", async (data, thunkAPI) => {
    try {
        return await postApi(API_ROUTES.user.register, data);
    } catch (err) {
        return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка регистрации. Попробуйте позже.");
    }
});

export const loginUser = createAsyncThunk("userData/loginUser", async (data, thunkAPI) => {
    try {
        return await postApi(API_ROUTES.user.login, data);
    } catch (err) {
        return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка авторизации. Попробуйте позже.");
    }
});

export const resendVerification = createAsyncThunk("userData/resendVerification", async (data, thunkAPI) => {
    try {
        const state = thunkAPI.getState();
        const tempAuthToken = state.userData?.tempAuthToken || localStorage.getItem("tempAuthToken");
        if (!tempAuthToken) {
            return thunkAPI.rejectWithValue("Ошибка отправки письма активации. Авторизуйтесь снова.");
        }
        return await postApi(API_ROUTES.user.resendVerification, { tempAuthToken });
    } catch (err) {
        return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Время сессии истекло. Авторизуйтесь снова.");
    }
});

export const checkAuth = createAsyncThunk("userData/checkAuth", async (data, thunkAPI) => {
    try {
        const state = thunkAPI.getState();
        const clientAccessToken = (typeof window !== 'undefined') ? localStorage.getItem('accessToken') : '';
        const accessToken = state.userData?.accessToken || clientAccessToken;
        return await postApi(
            API_ROUTES.user.validToken,
            {},
            {
                // Для SSR передаем куки из запроса
                headers: {
                    Cookie: typeof window === 'undefined'
                        ? thunkAPI.extra?.req.headers.cookie || ''
                        : '',
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        );
    } catch (err) {
        return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Время сессии истекло. Авторизуйтесь снова.");
    }
});

const initialState = {
    user: "", // имя пользователя
    isAuth: false, // если пользователь успешно авторизован и активирован
    errAuth: null, // ошибки
    registerStatus: "idle", // состояние запроса regUser: 'idle' | 'pending' | 'registered' | 'error'
    resendActStatus: "idle", // состояние запроса resendVerification: 'idle' | 'pending' | 'shipped' | 'error'
    loginStatus: "idle", // состояние запроса loginUser: 'idle' | 'pending' | 'authenticated' | 'unactivated' | 'error'
    tempAuthToken: null, // временный токен для отправки активации
    accessToken: null, // токен доступа - даётся в статусе authenticated
};

export const userDataSlice = createSlice({
    name: "userData",
    initialState,
    reducers: {
        setUserData: (state, action) => {
            state.user = action.payload;
        },
        setUserIsAuth: (state, action) => {
            state.isAuth = action.payload;
        },
        clearError: (state, action) => {
            if (action.payload) state.errAuth = initialState.errAuth;
        },
        setAuthToken: (state, action) => {
            if (action.payload !== state.tempAuthToken && typeof action.payload === "string") {
                state.tempAuthToken = action.payload;
            }
        },
        setResendCooldown: (state, action) => {
            state.resendCooldown = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- regUser ---
            .addCase(regUser.pending, (state) => {
                state.registerStatus = "pending";
                state.resendActStatus = initialState.resendActStatus;
                state.loginStatus = initialState.loginStatus;
                state.errAuth = null;
            })
            .addCase(regUser.fulfilled, (state, action) => {
                if (action.payload.success) {
                    state.registerStatus = "registered";
                    if (typeof action.payload.data?.tempAuthToken === "string") {
                        state.tempAuthToken = action.payload.data?.tempAuthToken;
                        localStorage.setItem("tempAuthToken", action.payload.data?.tempAuthToken);
                    }
                }
            })
            .addCase(regUser.rejected, (state, action) => {
                state.registerStatus = "error";
                const bodyError = action.payload.data?.errors || action.payload?.message;
                state.errAuth = bodyError || "Ошибка сервера. Попробуйте позже.";
            })
            // --- loginUser ---
            .addCase(loginUser.pending, (state) => {
                state.loginStatus = "pending";
                state.resendActStatus = initialState.resendActStatus;
                state.registerStatus = initialState.registerStatus;
                state.errAuth = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                if (action.payload.success) {
                    state.loginStatus = "authenticated";
                    state.isAuth = true;
                    state.tempAuthToken = initialState.tempAuthToken;
                    localStorage.removeItem("tempAuthToken");
                    state.user = action.payload.data?.username || "";
                    if (typeof action.payload.data?.accessToken === "string") {
                        state.accessToken = action.payload.data?.accessToken;
                        localStorage.setItem("accessToken", action.payload.data?.accessToken);
                    }
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                if (action.payload?.code === "ACCOUNT_NOT_ACTIVATED") {
                    console.log(action.payload.data?.tempAuthToken);
                    state.loginStatus = "unactivated";
                    if (typeof action.payload.data?.tempAuthToken === "string") {
                        state.tempAuthToken = action.payload.data?.tempAuthToken;
                        localStorage.setItem("tempAuthToken", action.payload.data?.tempAuthToken);
                    }
                } else {
                    state.loginStatus = "error";
                    const bodyError = action.payload.data?.errors || action.payload?.message;
                    state.errAuth = bodyError || "Ошибка сервера. Попробуйте позже.";
                }
            })
            // --- resendVerification ---
            .addCase(resendVerification.pending, (state) => {
                state.resendActStatus = "pending";
                state.errAuth = null;
            })
            .addCase(resendVerification.fulfilled, (state, action) => {
                if (action.payload.success) {
                    state.resendActStatus = "shipped";
                }
            })
            .addCase(resendVerification.rejected, (state, action) => {
                state.resendActStatus = "error";
                const bodyError = action.payload.data?.errors || action.payload?.message;
                state.errAuth = bodyError || "Ошибка сервера. Попробуйте позже.";
            })
            // --- checkAuth ---
            .addCase(checkAuth.pending, (state) => {
                state.errAuth = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                if (action.payload.success) {
                    state.loginStatus = "authenticated";
                    state.isAuth = true;
                    state.user = action.payload.data?.username || "";
                    if (typeof action.payload.data?.accessToken === "string" && action.payload.data?.isNewToken) {
                        state.accessToken = action.payload.data?.accessToken;
                        if (typeof window !== 'undefined') localStorage.setItem("accessToken", action.payload.data?.accessToken);
                    }
                }
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.loginStatus = "error";
                state.isAuth = false;
                state.accessToken = null;
                if (typeof window !== 'undefined') localStorage.removeItem("accessToken");
                const bodyError = action.payload.data?.errors || action.payload?.message;
                state.errAuth = bodyError || "Ошибка сервера. Попробуйте позже.";
            })
    // .addCase(logout.fulfilled, (state) => {
    //         state.accessToken = null;
    //         localStorage.removeItem('accessToken');
    //     })
    },
});

export const { setUserData, setUserIsAuth, clearError, setAuthToken, setResendCooldown, resetVerificationState } = userDataSlice.actions;
export default userDataSlice.reducer;