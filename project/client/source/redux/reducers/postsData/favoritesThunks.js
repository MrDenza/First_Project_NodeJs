import { API_ROUTES } from "../../../constants/apiRoutes";
import { postApi } from "../../../utils/postApi";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const addFavorite = createAsyncThunk("favorites/addFavorite", async ({ userId, postId }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const accessToken = state.userData?.accessToken || "";

        const response = await postApi(
            `${API_ROUTES.favorites.add}/${postId}`,
            { userId },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data.userFavoritesIdList;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const removeFavorite = createAsyncThunk("favorites/removeFavorite", async ({ userId, postId }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const accessToken = state.userData?.accessToken || "";

        const response = await postApi(
            `${API_ROUTES.favorites.remove}/${postId}`,
            { userId },
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return response.data.userFavoritesIdList;
    } catch (error) {
        return rejectWithValue(error);
    }
});