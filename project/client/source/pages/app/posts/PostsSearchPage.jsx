import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi } from '../../../utils/getApi';
import { API_ROUTES } from '../../../constants/apiRoutes';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './PostsSearchPage.css';
import { Helmet } from "react-helmet-async";

const PostsSearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastSearch, setLastSearch] = useState('');
    const navigate = useNavigate();

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        setError('');
        setLastSearch(searchQuery);

        try {
            const response = await getApi(API_ROUTES.posts.search, {
                q: searchQuery,
                offset: 0,
                limit: 20
            });

            setSearchResults(response.data);
        } catch (err) {
            setError('Ошибка при выполнении поиска');
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    // Подсветка совпадений
    const highlightMatches = useCallback((text) => {
        if (!text || !lastSearch) return { __html: text || '' };

        const words = lastSearch.split(/\s+/)
        .filter(w => w.length > 1)
        .map(w => escapeRegExp(w));

        if (words.length === 0) return { __html: text };

        let highlighted = text;

        words.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });

        return { __html: highlighted };
    }, [lastSearch]);

    const escapeRegExp = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="posts-search-page">
            <Helmet>
                <title>Поиск по постам | Messarea</title>
                <meta name="description" content="Поисковик" />
            </Helmet>
            <div className="posts-search-page__header">
                <h1 className="posts-search-page__title">Поиск по постам</h1>

                <div className="posts-search-page__search-bar">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Введите ключевые слова..."
                        className="posts-search-page__search-input"
                    />
                    <button
                        onClick={handleSearch}
                        className="posts-search-page__search-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Поиск...' : 'Найти'}
                    </button>
                </div>
            </div>

            {error && <div className="posts-search-page__error">{error}</div>}

            <div className="posts-search-page__results">
                {searchResults.map(post => (
                    <div
                        key={post.id}
                        className="posts-search-page__result-item"
                        onClick={() => navigate(`/posts/view/${post.id}`)}
                    >
                        <h2 className="posts-search-page__result-title">
                            {post.title}
                        </h2>

                        <div
                            className="posts-search-page__result-fragment"
                            dangerouslySetInnerHTML={highlightMatches(post.textFragment)}
                        />

                        <div className="posts-search-page__result-meta">
                            <span>Автор: {post.author_username}</span>
                            <span>Дата: {new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {isLoading && <LoadingSpinner />}

            {!isLoading && searchResults.length === 0 && lastSearch && (
                <div className="posts-search-page__empty">
                    По запросу "{lastSearch}" ничего не найдено
                </div>
            )}
        </div>
    );
};

export default PostsSearchPage;