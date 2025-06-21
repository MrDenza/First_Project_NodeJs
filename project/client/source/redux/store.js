import { configureStore } from '@reduxjs/toolkit';
import userAuthSlice from "./reducers/userAuth/userAuthSlice";

export function createStore(preloadedState = {}, serverReq = null) {
    return configureStore({
        reducer: {
            userAuth: userAuthSlice,
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