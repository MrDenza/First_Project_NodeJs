import PageAuth from "../pages/app/auth/AuthPage";
import SafeNavigate from "../components/routes/SafeNavigate";
import { Outlet } from "react-router-dom";
import ErrorPage from "../pages/app/error/ErrorPage";
import { refreshToken } from "../redux/reducers/userData/userDataSlice";
import AppLayout from "../layouts/AppLayout";
import PostsListPage from "../pages/app/posts/PostsListPage";
import FeedPage from "../pages/app/feed/FeedPage";
import PostsLayout from "../layouts/PostsLayout";
import UserLayout from "../layouts/UserLayout";
import AuthLayout from "../layouts/AuthLayout";
import PostsItemPage from "../pages/app/posts/PostsItemPage";
import AuthLogout from "../pages/app/auth/AuthLogout";
import DevelopedPage from "../pages/app/developed/DevelopedPage";
import { fetchFeedPosts, fetchPost } from "../redux/reducers/postsData/postsDataSlice";
import PostsSearchPage from "../pages/app/posts/PostsSearchPage";
import HomePage from "../pages/app/home/HomePage";

export const routeConfig = [
    {
        path: "/",
        element: <Outlet />,
        children: [
            // App
            {
                element: <AppLayout />,
                ssrLoadData: () => refreshToken(), // Thunk
                children: [
                    // Home
                    {
                        index: true,
                        element: <HomePage />,
                    },
                    // Auth
                    {
                        path: "auth",
                        element: <AuthLayout />,
                        children: [
                            // Sign-in
                            {
                                path: "sign-in",
                                element: <PageAuth mode="login" />,
                            },
                            // Sign-up
                            {
                                path: "sign-up",
                                element: <PageAuth mode="register" />,
                            },
                            // Verified
                            {
                                path: "verified",
                                element: <PageAuth mode="verified" />,
                            },
                            // Logout
                            {
                                path: "logout",
                                element: <AuthLogout />,
                            },
                            // Ошибка пути
                            {
                                path: "*",
                                element: (
                                    <SafeNavigate
                                        to="/auth/sign-in"
                                        replace
                                    />
                                ),
                            },
                        ],
                    },
                    // Feed
                    {
                        path: "feed",
                        element: <FeedPage />,
                        ssrLoadData: () => fetchFeedPosts({ page: 1 }), // Thunk
                    },
                    // Posts
                    {
                        path: "posts",
                        element: <PostsLayout />,
                        children: [
                            // Posts - search
                            {
                                path: "search",
                                element: <PostsSearchPage />,
                            },
                            // Posts - favorites
                            {
                                path: "favorites",
                                element: <PostsListPage />,
                                private: true,
                                privateRedirectTo: "/auth/sign-in",
                            },

                            // Posts - view
                            {
                                path: "view/:id",
                                element: <PostsItemPage mode="view" />,
                                ssrLoadData: (params) => fetchPost(params.id), // Thunk
                            },
                            // Posts - create
                            {
                                path: "create",
                                element: <PostsItemPage mode="create" />,
                                private: true,
                                privateRedirectTo: "/auth/sign-in",
                            },
                            // Posts - edit
                            {
                                path: "edit/:id",
                                element: <PostsItemPage mode="edit" />,
                                ssrLoadData: (params) => fetchPost(params.id), // Thunk
                                private: true,
                                privateRedirectTo: "/auth/sign-in",
                            },
                            // Ошибка пути
                            {
                                path: "*",
                                element: (
                                    <SafeNavigate
                                        to="/posts/search"
                                        replace
                                    />
                                ),
                            },
                        ],
                    },
                    // User
                    {
                        path: "user",
                        element: <UserLayout />,
                        private: true,
                        privateRedirectTo: "/auth/sign-in",
                        children: [
                            // Settings
                            {
                                path: "settings",
                                element: <DevelopedPage />,
                            },
                            // Ошибка пути
                            {
                                path: "*",
                                element: (
                                    <SafeNavigate
                                        to="/user/settings"
                                        replace
                                    />
                                ),
                            },
                        ],
                    },
                    // Error
                    {
                        path: "error",
                        element: <ErrorPage />,
                    },
                ],
            },
            // Ошибка пути
            {
                path: "*",
                element: (
                    <SafeNavigate
                        to="/error"
                        replace
                    />
                ),
            },
        ],
    },
];