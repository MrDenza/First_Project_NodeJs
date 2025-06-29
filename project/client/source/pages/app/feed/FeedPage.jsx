import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeedPosts } from "../../../redux/reducers/postsData/postsDataSlice";
import PostCard from "../../../components/Post/PostCard";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import "./FeedPage.css";
import { Helmet } from "react-helmet-async";

const FeedPage = () => {
    const dispatch = useDispatch();
    const {
        feedPosts,
        feedPage,
        feedTotalPages,
        feedStatus
    } = useSelector(state => state.postsData);

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observer = useRef();

    // Загрузка начальных данных
    useEffect(() => {
        dispatch(fetchFeedPosts({ page: 1 }));
    }, []);

    // Обработчик для бесконечной прокрутки
    const lastPostRef = useCallback(node => {
        if (feedStatus === 'loading' || feedStatus === 'loading-more') return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && feedPage < feedTotalPages) {
                setIsLoadingMore(true);
                dispatch(fetchFeedPosts({ page: feedPage + 1 }))
                .finally(() => setIsLoadingMore(false));
            }
        });

        if (node) observer.current.observe(node);
    }, [feedStatus, feedPage, feedTotalPages, dispatch]);

    return (
        <div className="feed-page">
            <Helmet>
                <title>Лента постов | Messarea</title>
                <meta name="description" content="Лента с постами" />
            </Helmet>

            <h1 className="feed-page__title">Лента постов</h1>

            <div className="feed-page__posts">
                {feedPosts.map((post, index) => (
                    <PostCard
                        key={`${post.id}-${index}`}
                        post={post}
                        ref={index === feedPosts.length - 1 ? lastPostRef : null}
                    />
                ))}
            </div>

            {(feedStatus === 'loading' || isLoadingMore) && (
                <div className="feed-page__loader">
                    <LoadingSpinner />
                </div>
            )}

            {feedStatus === 'succeeded' && feedPosts.length === 0 && (
                <div className="feed-page__empty">
                    <p>Пока нет постов в ленте</p>
                    <p>Будьте первым, кто создаст пост!</p>
                </div>
            )}

            {feedStatus === 'succeeded' && feedPosts.length > 0 && feedPage < feedTotalPages && !isLoadingMore && (
                <div className="feed-page__pagination">
                    <button
                        className="feed-page__load-more"
                        onClick={() => {
                            setIsLoadingMore(true);
                            dispatch(fetchFeedPosts({ page: feedPage + 1 }))
                            .finally(() => setIsLoadingMore(false));
                        }}
                        disabled={isLoadingMore}
                    >
                        {isLoadingMore ? 'Загрузка...' : 'Загрузить еще'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeedPage;