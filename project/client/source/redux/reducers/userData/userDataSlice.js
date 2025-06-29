import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_ROUTES } from "../../../constants/apiRoutes";
import { postApi } from "../../../utils/postApi";
import { isTokenValid } from "../../../utils/token";
import isEnglishText from "../../../utils/isEnglistText";
import { addFavorite, removeFavorite } from "../postsData/favoritesThunks";

const setErrMsg = (err) => {
    return err && !isEnglishText(err) ? err : "Ошибка сервера. Попробуйте позже.";
};

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

export const checkToken = createAsyncThunk("userData/checkToken", async (_, thunkAPI) => {
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

export const refreshToken = createAsyncThunk("userData/refreshToken", async (data, thunkAPI) => {
    try {
        const state = thunkAPI.getState();
        const accessToken = state.userData?.accessToken || "";
        return await postApi(
            API_ROUTES.user.validToken,
            {},
            {
                // Для SSR передаем куки из запроса
                headers: {
                    Cookie: typeof window === "undefined" ? thunkAPI.extra?.req.headers.cookie || "" : "",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
    } catch (err) {
        return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Время сессии истекло. Авторизуйтесь снова.");
    }
});

export const logoutUser = createAsyncThunk("userData/logoutUser", async (_, thunkAPI) => {
    try {
        const state = thunkAPI.getState();
        const accessToken = state.userData?.accessToken || "";
        return await postApi(
            API_ROUTES.user.logout,
            { accessToken },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
    } catch (err) {
        return thunkAPI.rejectWithValue(typeof err === "object" ? err : "Ошибка выхода из аккаунта. Попробуйте позже.");
    }
});

const initialState = {
    user: "", // имя пользователя
    userFavorites: [], // избранные посты пользователя
    isAuth: false, // если пользователь успешно авторизован и активирован
    isAdmin: false,
    authCheckStatus: "idle", // состояние автоматической авторизации 'idle' | 'pending' | 'succeeded' | 'failed' | 'logout'
    errAuth: null, // ошибки авторизации
    errFav: null, // ошибки списка избранных
    favStatus: "idle", // состояние запроса списка избранных: 'idle' | 'loading' | 'succeeded' | 'error'
    registerStatus: "idle", // состояние запроса regUser: 'idle' | 'pending' | 'registered' | 'error'
    resendActStatus: "idle", // состояние запроса resendVerification: 'idle' | 'pending' | 'shipped' | 'error'
    loginStatus: "idle", // состояние запроса loginUser: 'idle' | 'pending' | 'authenticated' | 'unactivated' | 'error' | 'logout'
    tempAuthToken: null, // временный токен для отправки активации
    accessToken: null, // токен доступа - даётся в статусе authenticated
};

export const userDataSlice = createSlice({
    name: "userData",
    initialState,
    reducers: {
        clearError: (state, action) => {
            if (action.payload) state.errAuth = initialState.errAuth;
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
                // Добавляем пост в избранное
                state.userFavorites.push(postId);
            } else {
                // Удаляем пост из избранного
                state.userFavorites.splice(index, 1);
            }
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
                    state.isAdmin = action.payload.data?.isAdmin;
                    state.userFavorites = action.payload.data?.userFavoritesIdList || [];
                    state.authCheckStatus = "succeeded";
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
                    state.authCheckStatus = "failed";
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
            .addCase(checkToken.fulfilled, (state) => {
                state.isAuth = true;
                state.authCheckStatus = "succeeded";
            })
            .addCase(checkToken.rejected, (state) => {
                state.accessToken = null;
                state.isAuth = false;
                state.authCheckStatus = "failed";
            })
            // --- refreshToken ---
            .addCase(refreshToken.pending, (state) => {
                state.errAuth = null;
                state.authCheckStatus = "pending";
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                if (action.payload.success) {
                    state.loginStatus = "authenticated";
                    state.authCheckStatus = "succeeded";
                    state.isAuth = true;
                    state.isAdmin = action.payload.data?.isAdmin;
                    state.userFavorites = action.payload.data?.userFavoritesIdList || [];
                    state.user = action.payload.data?.username || "";
                    if (typeof action.payload.data?.accessToken === "string" && action.payload.data?.isNewToken) {
                        state.accessToken = action.payload.data?.accessToken;
                    }
                }
            })
            .addCase(refreshToken.rejected, (state) => {
                state.loginStatus = "error";
                state.authCheckStatus = "failed";
                state.isAuth = false;
                state.isAdmin = false;
                state.accessToken = null;
            })
            // --- Logout ---
            .addCase(logoutUser.fulfilled, (state) => {
                Object.assign(state, initialState);
                state.loginStatus = "logout";
                state.authCheckStatus = "logout";
            })
            .addCase(logoutUser.rejected, (state, action) => {
                const bodyError = action.payload.data?.errors || action.payload?.message;
                state.errAuth = setErrMsg(bodyError);
            })
            // --- Favorites Add ---
            .addCase(addFavorite.pending, (state) => {
                state.favStatus = "loading";
            })
            .addCase(addFavorite.fulfilled, (state, action) => {
                state.favStatus = "succeeded";
                state.userFavorites = action.payload;
            })
            .addCase(addFavorite.rejected, (state, action) => {
                state.favStatus = "error";
                const bodyError = action.payload.data?.errors || action.payload?.message;
                state.errFav = setErrMsg(bodyError);
            })
            // --- Favorites Remove ---
            .addCase(removeFavorite.pending, (state) => {
                state.favStatus = "loading";
            })
            .addCase(removeFavorite.fulfilled, (state, action) => {
                state.favStatus = "succeeded";
                state.userFavorites = action.payload;
            })
            .addCase(removeFavorite.rejected, (state, action) => {
                state.favStatus = "error";
                const bodyError = action.payload.data?.errors || action.payload?.message;
                state.errFav = setErrMsg(bodyError);
            });
    },
});

export const { clearError, setAuthToken, updateUserFavorites } = userDataSlice.actions;
export default userDataSlice.reducer;