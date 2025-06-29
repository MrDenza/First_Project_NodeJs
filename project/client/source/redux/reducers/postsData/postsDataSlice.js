import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { postApi } from "../../../utils/postApi";
import { deepMerge } from "../../../utils/deepMerge";
import { API_ROUTES } from "../../../constants/apiRoutes";
import { clearTempImages, getFromIndexedDB } from "../../../utils/db";
import { getFileExtension } from "../../../utils/fileUtils";
import isEnglishText from "../../../utils/isEnglistText";
import { getApi } from "../../../utils/getApi";

const setErrMsg = (err) => {
    return err && !isEnglishText(err) ? err : "Ошибка сервера. Попробуйте снова.";
};

export const fetchPost = createAsyncThunk("post/fetchPost", async (postId, { rejectWithValue }) => {
    try {
        return await getApi(`${API_ROUTES.posts.get}/${postId}`);
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchUserPosts = createAsyncThunk("postsData/fetchUserPosts", async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const accessToken = state.userData?.accessToken || "";

    const postOptions = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };
    try {
        return await getApi(`${API_ROUTES.posts.userPosts}`, {}, postOptions);
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchFavoritePosts = createAsyncThunk("postsData/fetchFavoritePosts", async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const accessToken = state.userData?.accessToken || "";
    const postOptions = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };
    try {
        return await getApi(`${API_ROUTES.posts.favorites}`, {}, postOptions);
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchFeedPosts = createAsyncThunk("postsData/fetchFeedPosts", async ({ page = 1 } = {}, { rejectWithValue }) => {
    try {
        const response = await getApi(`${API_ROUTES.posts.feed}?page=${page}&limit=10`);

        return {
            posts: response.data.posts,
            page,
            total: response.data.total,
            totalPages: response.data.totalPages,
        };
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const savePost = createAsyncThunk("postsData/savePost", async ({ isNew }, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const { postData, images } = state.postsData;
        const accessToken = state.userData?.accessToken || "";
        const postOptions = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        };

        let postId;
        console.log();
        if (isNew) {
            const savedPost = await postApi(API_ROUTES.posts.create, postData, postOptions);
            postId = savedPost.data.postId;
        } else {
            await postApi(`${API_ROUTES.posts.update}/${postData.meta.id}`, postData, postOptions);
            postId = postData.meta.id;
        }

        const updatedBlocks = [...postData.content];
        const uploadPromises = [];

        for (const [blockId, imageInfo] of Object.entries(images)) {
            const blockIndex = updatedBlocks.findIndex((b) => b.id === blockId);
            if (blockIndex === -1) continue;

            const block = updatedBlocks[blockIndex];
            if (block.type !== "image") continue;

            // Получаем файл из IndexedDB
            const file = await getFromIndexedDB(imageInfo.key);

            // Определяем имя и расширение файла
            const fileExtension = getFileExtension(block.data.fileType);
            const serverFileName = `${block.data.fileName}.${fileExtension}`;

            const headers = {
                ...postOptions.headers,
                "x-post-id": postId,
                "x-file-name": encodeURIComponent(serverFileName),
                "x-block-id": encodeURIComponent(blockId),
            };

            uploadPromises.push(
                // с await - последовательно загружаем, без - лимит параллельной загрузки
                await postApi(`${API_ROUTES.posts.upload}/${postId}`, file, { headers })
            );
        }

        await Promise.all(uploadPromises);
        await clearTempImages();
        return true;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const deletePost = createAsyncThunk("postsData/deletePost", async (postId, { getState, rejectWithValue }) => {
    try {
        const state = getState();
        const accessToken = state.userData?.accessToken || "";
        await postApi(`${API_ROUTES.posts.delete}/${postId}`, null, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return postId;
    } catch (error) {
        return rejectWithValue(error);
    }
});

const postsDataSlice = createSlice({
    name: "postsData",
    initialState: {
        userPosts: [],
        favoritePosts: [],
        postData: {},
        statusFavList: "idle", // idle, loading, succeeded, error
        statusFav: "idle", // idle, loading, succeeded, error
        statusDelete: "idle", // idle, loading, succeeded, error
        statusGet: "idle", // idle, loading, succeeded, error
        statusSend: "idle", // idle, loading, succeeded, error
        error: false, // {status, message}
        errorFavList: false, // {status, message}
        images: {},
        feedPosts: [],
        feedPage: 1,
        feedTotal: 0,
        feedTotalPages: 1,
        feedStatus: "idle", // 'idle' | 'loading' | 'loading-more' | 'succeeded' | 'failed'
        errorFeed: false, // {status, message}
    },
    reducers: {
        setPostData: (state, action) => {
            state.postData = action.payload;
        },
        mergePostData: (state, action) => {
            state.postData = deepMerge(state.postData, action.payload);
        },
        updatePostData: (state, action) => {
            if (state.postData) {
                state.postData = { meta: { ...state.postData.meta, ...action.payload.meta }, content: action.payload.content };
            } else {
                state.postData = action.payload;
            }
        },
        addImage: (state, action) => {
            const { blockId, key, file, fileName } = action.payload;
            state.images[blockId] = { key, file, fileName };
        },
        clearPostState: (state) => {
            state.postData = {};
            state.statusSend = "idle";
            state.error = null;
            state.images = {};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPost.pending, (state) => {
                state.statusGet = "loading";
            })
            .addCase(fetchPost.fulfilled, (state, action) => {
                state.statusGet = "succeeded";
                state.postData = action.payload.data;
            })
            .addCase(fetchPost.rejected, (state, action) => {
                state.statusGet = "error";
                const bodyError = action.payload?.message;
                state.error = bodyError || "Ошибка загрузки поста";
            })
            .addCase(savePost.pending, (state) => {
                state.statusSend = "loading";
            })
            .addCase(savePost.fulfilled, (state, action) => {
                state.statusSend = "succeeded";
                state.data = action.payload;
                state.images = {};
                if (action.payload.isNew) {
                    state.postData.meta.id = action.payload.postId;
                }
            })
            .addCase(savePost.rejected, (state, action) => {
                state.statusSend = "error";
                const bodyError = action.payload?.message;
                state.error = setErrMsg(bodyError);
            })
            .addCase(deletePost.pending, (state) => {
                state.statusDelete = "loading";
            })
            .addCase(deletePost.fulfilled, (state) => {
                state.statusDelete = "succeeded";
                state.postData = {};
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.statusDelete = "error";
                const bodyError = action.payload?.message;
                state.error = setErrMsg(bodyError);
            })

            .addCase(fetchUserPosts.pending, (state) => {
                state.statusFavList = "loading";
            })
            .addCase(fetchUserPosts.fulfilled, (state, action) => {
                state.statusFavList = "succeeded";
                state.userPosts = action.payload.data;
            })
            .addCase(fetchUserPosts.rejected, (state, action) => {
                state.statusFavList = "error";
                const bodyError = action.payload?.message;
                state.errorFavList = setErrMsg(bodyError);
            })
            .addCase(fetchFavoritePosts.pending, (state) => {
                state.statusFavList = "loading";
            })
            .addCase(fetchFavoritePosts.fulfilled, (state, action) => {
                state.statusFavList = "succeeded";
                state.favoritePosts = action.payload.data;
            })
            .addCase(fetchFavoritePosts.rejected, (state, action) => {
                state.statusFavList = "error";
                const bodyError = action.payload?.message;
                state.errorFavList = setErrMsg(bodyError);
            })
            .addCase(fetchFeedPosts.pending, (state, action) => {
                if (action.meta.arg.page === 1) {
                    state.feedStatus = "loading";
                } else {
                    state.feedStatus = "loading-more";
                }
            })
            .addCase(fetchFeedPosts.fulfilled, (state, action) => {
                state.feedStatus = "succeeded";
                if (action.payload.page === 1) {
                    state.feedPosts = action.payload.posts;
                } else {
                    state.feedPosts = [...state.feedPosts, ...action.payload.posts];
                }
                state.feedPage = action.payload.page;
                state.feedTotal = action.payload.total;
                state.feedTotalPages = action.payload.totalPages;
            })
            .addCase(fetchFeedPosts.rejected, (state, action) => {
                state.feedStatus = "failed";
                state.errorFeed = action.payload?.message;
            });
    },
});

export const { setPostData, updatePostData, addImage, clearPostState, mergePostData } = postsDataSlice.actions;
export default postsDataSlice.reducer;