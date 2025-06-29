import { configureStore } from "@reduxjs/toolkit";
import userDataSlice from "./reducers/userData/userDataSlice";
import appSettingsSlice from "./reducers/appSettings/appSettingsSlice";
import postsDataSlice from "./reducers/postsData/postsDataSlice";

export function createStore(preloadedState = {}, serverReq = null) {
    return configureStore({
        reducer: {
            userData: userDataSlice,
            appSettings: appSettingsSlice,
            postsData: postsDataSlice,
        },
        preloadedState,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                thunk: {
                    extraArgument: { req: serverReq },
                },
            }),
    });
}