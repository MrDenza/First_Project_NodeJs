import { configureStore } from '@reduxjs/toolkit';
import userDataSlice from "./reducers/userData/userDataSlice";

export function createStore(preloadedState = {}, serverReq = null) {
    return configureStore({
        reducer: {
            userData: userDataSlice,
        },
        preloadedState,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                thunk: {
                    extraArgument: { req: serverReq }
                }
            }),
    });
}