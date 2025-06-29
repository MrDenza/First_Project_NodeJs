import React, { memo, useEffect, useRef } from "react";
import './PostsItemPage.css';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import PostEditor from "../../../components/Editor/PostEditor";
import PostView from "../../../components/Editor/PostView";
import PostsNav from "../../../components/Post/PostsNav";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { useState } from "react";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { setUnsavedChanges } from "../../../redux/reducers/appSettings/appSettingsSlice"
import {
    clearPostState,
    deletePost,
    fetchPost,
    mergePostData,
    savePost,
    setPostData,
    updatePostData,
} from "../../../redux/reducers/postsData/postsDataSlice";
import { clearTempImages } from "../../../utils/db";
import { addFavorite, removeFavorite } from "../../../redux/reducers/postsData/favoritesThunks";
import SafeNavigate from "../../../components/routes/SafeNavigate";

const SITE_TITLE = import.meta.env.VITE_SITE_NAME;

const PostsItemPage = ({ mode: initialMode }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuth, isAdmin, userFavorites} = useSelector(state => state.userData);
    const post = useSelector(state => state.postsData.postData);
    const statusSend = useSelector(state => state.postsData.statusSend);
    const error = useSelector(state => state.postsData.error);
    const statusGet = useSelector(state => state.postsData.statusGet);

    const [localMode, setLocalMode] = useState(initialMode === 'view' ? 'view' : 'edit');
    const [isClearing, setIsClearing] = useState(true);
    const [editorData, setEditorData] = useState(null);

    const isCreateMode = initialMode === "create";
    const isOwnerOrAdmin = isAdmin || post?.meta?.author === user;
    const isAuthor = post?.meta?.author === user;
    const postRef = useRef();

    const isFav = userFavorites?.includes(Number(id));

    useEffect(() => {
        if (initialMode === "create") {
            setIsClearing(true);
            clearTempImages().then();
        }
    }, [initialMode]);

    useEffect(() => {
        if (isClearing && isCreateMode && Object.keys(post).length > 0) {
            setIsClearing(true);
            dispatch(clearPostState());
        } else {
            //setIsClearing(false);
        }
    }, [initialMode, post, dispatch, isCreateMode]);

    useEffect(() => {
        if (isClearing && Object.keys(post).length === 0) {
            setIsClearing(false);
        }
    }, [post, isClearing]);

    // Загрузка поста при монтировании
    useEffect(() => {
        if (!isCreateMode && id && id !== String(post?.meta?.id)) {
            dispatch(clearPostState());
            dispatch(fetchPost(id));
        }
        return () => {};
    }, [id, isCreateMode, dispatch]);

    useEffect(() => {
        if (statusGet === "error") {
            dispatch(clearPostState());
            navigate(`/error?code=404&message=Пост не найден`);
        }
    }, [statusGet, error, navigate]);

    usePageTitle(
        isCreateMode
            ? (localMode === "edit"
                ? `Новая статья | ${SITE_TITLE}`
                : `Предпросмотр новой статьи | ${SITE_TITLE}`)
            : initialMode === "view" && post?.meta?.title
                ? `${post?.meta?.title} | ${SITE_TITLE}`
                : localMode === "edit"
                        ? `Редактирование статьи #${id} | ${SITE_TITLE}`
                        : `Предпросмотр статьи #${id} | ${SITE_TITLE}`
    );

    if ((initialMode === "edit" || initialMode === "view") && !/^\d+$/.test(id)) {
        return <SafeNavigate to="/error" replace />
    }

    if (statusGet === "error" && !post?.meta) {
        return <SafeNavigate to="/error?code=404&message=Пост не найден" replace />;
    }

    if (statusSend === "loading" || statusGet === "loading" || (!isCreateMode && !post?.meta)  || (isCreateMode && isClearing)) {
        return <LoadingSpinner />;
    }

    const toggleMode = () => {
        if (isCreateMode || initialMode === "edit") {
            const updatedPost = postRef.current?.getContent?.();
            if (updatedPost) {
                setEditorData(updatedPost);
                isCreateMode ? dispatch(setPostData(updatedPost)) : dispatch(updatePostData(updatedPost));
                setLocalMode('view');
                return;
            }
            if (localMode === "view") setLocalMode( "edit");
        } else if (initialMode === "view" && isOwnerOrAdmin) {
            navigate(`/posts/edit/${id}`);
        }
    };

    const handleSave = async () => {
        try {
            const postData = postRef?.current?.getContent() || editorData;

            if (postData) {
                dispatch(mergePostData(postData));

                await dispatch(savePost({
                    isNew: isCreateMode
                })).unwrap();

                dispatch(setUnsavedChanges(false));
                navigate("/posts/favorites");
            }
        } catch (error) {
            console.error("Ошибка сохранения:", error);

            if (error.message.includes("IMAGE_UPLOAD_FAILED")) {
                const blockId = error.message.split(":")[1];
                alert(`Ошибка загрузки изображения для блока ${blockId}. Попробуйте снова.`);
            } else {
                alert("Ошибка сохранения поста. Попробуйте снова.");
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Вы уверены, что хотите удалить этот пост?")) {
            try {
                await dispatch(deletePost(id)).unwrap();
                dispatch(setUnsavedChanges(false));
                navigate("/posts/favorites");
            } catch (error) {
                console.error("Ошибка удаления:", error);
            }
        }
    };

    const handleFavorite = async () => {
        try {
            if (isFav) {
                await dispatch(removeFavorite({ userId: user.id, postId: id })).unwrap();
            } else {
                await dispatch(addFavorite({ userId: user.id, postId: id })).unwrap();
            }
        } catch (error) {
            console.error("Ошибка избранного:", error);
        }
    }

    const handleOnChange = () => {
        dispatch(setUnsavedChanges(true));
    }

    return (
        <div>
            { initialMode !== 'view' && (
                <h1 className="postsitem__title">
                    {isCreateMode
                        ? (localMode === "edit")
                            ? "Новая статья"
                            : "Предпросмотр новой статьи"
                        : localMode === "edit"
                            ? `Редактирование статьи #${id}`
                            : `Предпросмотр статьи #${id}`
                    }
                </h1>
            )}

            {isAuth && (
                <PostsNav
                    mode={initialMode}
                    viewMode={localMode}
                    onToggleMode={toggleMode}
                    isCreateMode={isCreateMode}
                    isOwnerOrAdmin={isOwnerOrAdmin}
                    isAuthor={isAuthor}
                    isFav={isFav}
                    onSave={handleSave}
                    onFav={!isCreateMode ? () => handleFavorite() : null}
                    onDelete={!isCreateMode && isOwnerOrAdmin ? handleDelete : null}
                />
            )}

            {error && (
                <div className="postsitem__error">
                    {error}
                </div>
            )}

            {localMode === "view" ? (
                <PostView
                    meta={post?.meta}
                    content={post?.content}
                />
            ) : (
                <PostEditor
                    initState={post}
                    onChange={handleOnChange}
                    ref={postRef}
                />
            )}
        </div>
    );
};

export default memo(PostsItemPage);