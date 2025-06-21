import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_ROUTES } from "../../../constants/apiRoutes";
import { postApi } from "../../../utils/postApi";
import { isTokenValid } from "../../../utils/token";
import isEnglishText from "../../../utils/isEnglistText";

const setErrMsg = (err) => {
    return err && !isEnglishText(err) ? err : "Ошибка сервера. Попробуйте позже."
}

export const regUser = createAsyncThunk("userAuth/regUser", async (data, thunkAPI) => {
    try {
        return await postApi(API_ROUTES.user.register, data);
    } catch (err) {
        return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка регистрации. Попробуйте позже.");
    }
});

export const loginUser = createAsyncThunk("userAuth/loginUser", async (data, thunkAPI) => {
    try {
        return await postApi(API_ROUTES.user.login, data);
    } catch (err) {
        return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка авторизации. Попробуйте позже.");
    }
});

export const resendVerification = createAsyncThunk("userAuth/resendVerification", async (data, thunkAPI) => {
    try {
        const state = thunkAPI.getState();
        const tempAuthToken = state.userAuth?.tempAuthToken || localStorage.getItem("tempAuthToken");
        if (!tempAuthToken) {
            return thunkAPI.rejectWithValue("Ошибка отправки письма активации. Авторизуйтесь снова.");
        }
        return await postApi(API_ROUTES.user.resendVerification, { tempAuthToken });
    } catch (err) {
        return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Время сессии истекло. Авторизуйтесь снова.");
    }
});

export const checkToken = createAsyncThunk('userAuth/checkToken', async (_, thunkAPI) => {
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

export const refreshToken = createAsyncThunk("userAuth/refreshToken", async (data, thunkAPI) => {
    try {
        const state = thunkAPI.getState();
        const accessToken = state.userAuth?.accessToken || '';
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

export const logoutUser = createAsyncThunk("userAuth/logoutUser", async (_, thunkAPI) => {
    try {
        const state = thunkAPI.getState();
        const accessToken = state.userAuth?.accessToken || '';
        return await postApi(
            API_ROUTES.user.logout,
            {accessToken},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }
        );
    } catch (err) {
        return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка выхода из аккаунта. Попробуйте позже.");
    }
});

const initialState = {
    user: "", // имя пользователя
    isAuth: false, // если пользователь успешно авторизован и активирован
    authCheckStatus: 'idle', // состояние автоматической авторизации 'idle' | 'pending' | 'succeeded' | 'failed'
    errAuth: null, // ошибки
    registerStatus: "idle", // состояние запроса regUser: 'idle' | 'pending' | 'registered' | 'error'
    resendActStatus: "idle", // состояние запроса resendVerification: 'idle' | 'pending' | 'shipped' | 'error'
    loginStatus: "idle", // состояние запроса loginUser: 'idle' | 'pending' | 'authenticated' | 'unactivated' | 'error' | 'logout'
    tempAuthToken: null, // временный токен для отправки активации
    accessToken: null, // токен доступа - даётся в статусе authenticated
};

export const userAuthSlice = createSlice({
    name: "userAuth",
    initialState,
    reducers: {
        // setUserData: (state, action) => {
        //     state.user = action.payload;
        // },
        // setAuth: (state, action) => {
        //     state.isAuth = action.payload;
        // },
        clearError: (state, action) => {
            if (action.payload) state.errAuth = initialState.errAuth;
        },
        setAuthToken: (state, action) => {
            if (action.payload !== state.tempAuthToken && typeof action.payload === "string") {
                state.tempAuthToken = action.payload;
            }
        },
        // setAccessToken(state, action) {
        //     state.accessToken = action.payload;
        // },
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
                state.errAuth = setErrMsg(bodyError);
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
                    state.accessToken = action.payload.data?.accessToken;
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                if (action.payload?.code === "ACCOUNT_NOT_ACTIVATED") {
                    state.loginStatus = "unactivated";
                    if (typeof action.payload.data?.tempAuthToken === "string") {
                        state.tempAuthToken = action.payload.data?.tempAuthToken;
                        localStorage.setItem("tempAuthToken", action.payload.data?.tempAuthToken);
                    }
                } else {
                    state.loginStatus = "error";
                    const bodyError = action.payload.data?.errors || action.payload?.message;
                    state.errAuth = setErrMsg(bodyError);
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
                state.errAuth = setErrMsg(bodyError);
            })
            // --- checkToken ---
            .addCase(checkToken.pending, (state) => {
                state.authCheckStatus = 'pending';
            })
            .addCase(checkToken.fulfilled, (state) => {
                state.isAuth = true;
                state.authCheckStatus = 'succeeded';
            })
            .addCase(checkToken.rejected, (state) => {
                state.accessToken = null;
                state.isAuth = false;
                state.authCheckStatus = 'failed';
            })
            // --- refreshToken ---
            .addCase(refreshToken.pending, (state) => {
                state.errAuth = null;
                state.authCheckStatus = 'pending';
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                if (action.payload.success) {
                    state.loginStatus = "authenticated";
                    state.authCheckStatus = 'succeeded';
                    state.isAuth = true;
                    state.user = action.payload.data?.username || "";
                    if (typeof action.payload.data?.accessToken === "string" && action.payload.data?.isNewToken) {
                        state.accessToken = action.payload.data?.accessToken;
                    }
                }
            })
            .addCase(refreshToken.rejected, (state) => {
                state.loginStatus = "error";
                state.authCheckStatus = 'failed';
                state.isAuth = false;
                state.accessToken = null;
                //const bodyError = action.payload.data?.errors || action.payload?.message;
                //state.errAuth = setErrMsg(bodyError);
            })
            // --- Logout ---
            .addCase(logoutUser.fulfilled, (state) => {
                Object.assign(state, initialState);
                state.loginStatus = 'logout';
            })
            .addCase(logoutUser.rejected, (state, action) => {
                const bodyError = action.payload.data?.errors || action.payload?.message;
                state.errAuth = setErrMsg(bodyError);
            })
    },
});

export const { clearError, setAuthToken } = userAuthSlice.actions;
export default userAuthSlice.reducer;