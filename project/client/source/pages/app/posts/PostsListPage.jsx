import React, { useState, useEffect, memo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchUserPosts,
    fetchFavoritePosts,
    deletePost,
} from "../../../redux/reducers/postsData/postsDataSlice";
import { addFavorite, removeFavorite } from '../../../redux/reducers/postsData/favoritesThunks';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { FaBookmark } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { RiDeleteBin7Fill } from "react-icons/ri";
import './PostsListPage.css';
import { Helmet } from "react-helmet-async";

const PostsListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuth, isAdmin } = useSelector(state => state.userData);
    const { userPosts, favoritePosts, statusFavList } = useSelector(state => state.postsData);
    const [activeTab, setActiveTab] = useState('my');

    useEffect(() => {
        if (isAuth) {
            dispatch(fetchUserPosts());
            dispatch(fetchFavoritePosts());
        }
    }, [dispatch, isAuth]);

    const handleDelete = async (postId, e) => {
        e.stopPropagation();
        if (window.confirm('Вы уверены, что хотите удалить этот пост?')) {
            await dispatch(deletePost(postId));
            // Обновляем списки после удаления
            dispatch(fetchUserPosts());
            dispatch(fetchFavoritePosts());
        }
    };

    const handleToggleFavorite = async (postId, e) => {
        e.stopPropagation();
        const isFav = favoritePosts.some(p => p.id === postId);
        const action = isFav ? removeFavorite : addFavorite;

        await dispatch(action({ postId }));
        dispatch(fetchFavoritePosts());
    };

    const handlePostClick = (postId) => {
        navigate(`/posts/view/${postId}`);
    };

    const handleEdit = (postId, e) => {
        e.stopPropagation();
        navigate(`/posts/edit/${postId}`);
    };

    if (statusFavList === 'loading') return <LoadingSpinner />;

    return (
        <div className="posts-list-page">
            <Helmet>
                <title>Блокнот | Messarea</title>
                <meta name="description" content="Список избранного" />
            </Helmet>
            <h1 className="posts-list-page__page-title"> Блокнот </h1>

            <div className="posts-list-page__tabs">
                <button
                    className={`posts-list-page__tab-btn ${activeTab === 'my' ? 'posts-list-page__tab-btn--active' : ''}`}
                    onClick={() => setActiveTab('my')}
                >
                    Мои посты
                </button>
                <button
                    className={`posts-list-page__tab-btn ${activeTab === 'favorites' ? 'posts-list-page__tab-btn--active' : ''}`}
                    onClick={() => setActiveTab('favorites')}
                >
                    Избранное
                </button>
            </div>

            <div className="posts-list-page__posts-container">
                {(activeTab === 'my' ? userPosts : favoritePosts).map(post => (
                    <div
                        key={post.id}
                        className="posts-list-page__post-item"
                        onClick={() => handlePostClick(post.id)}
                    >
                        <div className="posts-list-page__post-content">
                            <h3 className="posts-list-page__post-title">{post.title}</h3>
                            <p className="posts-list-page__post-description">{post.description || 'Без описания'}</p>
                            <div className="posts-list-page__post-meta">
                                <span>Автор: {post.author?.username || 'Неизвестно'}</span>
                                <span>Статус: {post.status === 'published' ? 'Опубликован' : 'Черновик'}</span>
                            </div>
                        </div>

                        <div className="posts-list-page__post-actions">
                            {/* Для "Мои посты" - кнопки редактирования и удаления */}
                            {activeTab === 'my' && (
                                <>
                                    <button
                                        className="posts-list-page__action-btn"
                                        onClick={(e) => handleEdit(post.id, e)}
                                        title="Редактировать"
                                    >
                                        <MdEdit size={20} />
                                    </button>
                                    <button
                                        className="posts-list-page__action-btn"
                                        onClick={(e) => handleDelete(post.id, e)}
                                        title="Удалить"
                                    >
                                        <RiDeleteBin7Fill size={20} />
                                    </button>
                                </>
                            )}

                            {/* Для "Избранное" - кнопка избранного и админские кнопки */}
                            {activeTab === 'favorites' && (
                                <>
                                    <button
                                        className={`posts-list-page__action-btn posts-list-page__fav-btn`}
                                        onClick={(e) => handleToggleFavorite(post.id, e)}
                                        title="Убрать из избранного"
                                    >
                                        <FaBookmark size={20} />
                                    </button>

                                    {isAdmin && (
                                        <>
                                            <button
                                                className="posts-list-page__action-btn"
                                                onClick={(e) => handleEdit(post.id, e)}
                                                title="Редактировать"
                                            >
                                                <MdEdit size={20} />
                                            </button>
                                            <button
                                                className="posts-list-page__action-btn"
                                                onClick={(e) => handleDelete(post.id, e)}
                                                title="Удалить"
                                            >
                                                <RiDeleteBin7Fill size={20} />
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {(activeTab === 'my' && userPosts.length === 0) && (
                    <div className="posts-list-page__empty-state">
                        <p>У вас пока нет постов</p>
                        <button
                            className="posts-list-page__create-btn"
                            onClick={() => navigate('/posts/create')}
                        >
                            Создать первый пост
                        </button>
                    </div>
                )}

                {(activeTab === 'favorites' && favoritePosts.length === 0) && (
                    <div className="posts-list-page__empty-state">
                        <p>У вас пока нет избранных постов</p>
                        <button
                            className="posts-list-page__search-btn"
                            onClick={() => navigate('/posts/search')}
                        >
                            Найти интересные посты
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(PostsListPage);