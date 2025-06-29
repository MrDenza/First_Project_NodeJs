export const API_ROUTES = {
    user: {
        login: "/api/user/login",
        register: "/api/user/register",
        resendVerification: "/api/user/resend-verification",
        validToken: "/api/user/validate-tokens",
        logout: "/api/user/logout",
    },
    posts: {
        create: "/api/posts/create",
        update: "/api/posts/update",
        upload: "/api/posts/upload",
        delete: "/api/posts/delete",
        get: "/api/posts/get",
        userPosts: '/api/posts/user',
        favorites: '/api/posts/favorites',
        feed: '/api/posts/feed',
        search: '/api/posts/search',
    },
    favorites: {
        add: '/api/user/favorites',
        remove: '/api/user/favorites',
    },
};