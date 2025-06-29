import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    hasUnsavedChanges: false,
    pendingNavigation: null,
};

const appSettingsSlice = createSlice({
    name: "appSettings",
    initialState,
    reducers: {
        setUnsavedChanges: (state, action) => {
            state.hasUnsavedChanges = action.payload;
        },
        setPendingNavigation: (state, action) => {
            state.pendingNavigation = action.payload;
        },
        clearPendingNavigation: (state) => {
            state.pendingNavigation = null;
        },
    },
});

export const { setUnsavedChanges, setPendingNavigation, clearPendingNavigation } = appSettingsSlice.actions;

export default appSettingsSlice.reducer;
