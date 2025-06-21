import PageAuth from "../pages/app/auth/AuthPage";
import SafeNavigate from "../components/routes/SafeNavigate";
import { Outlet } from "react-router-dom";
import ErrorPage from "../pages/app/error/ErrorPage";
import { refreshToken } from "../redux/reducers/userAuth/userAuthSlice";
import AppLayout from "../layouts/AppLayout";
import NewsListPage from "../pages/app/posts/NewsListPage";
import NewsItemPage from "../pages/app/posts/NewsItemPage";
import FeedPage from "../pages/app/feed/FeedPage";
import NewsLayout from "../layouts/NewsLayout";
import UserLayout from "../layouts/UserLayout";
import UserSettingsPage from "../pages/app/user/UserSettingsPage";
import AuthLayout from "../layouts/AuthLayout";

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
                        element: <span>home</span>,
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
                            // Ошибка пути
                            {
                                path: "*",
                                element: <SafeNavigate to="/auth/sign-in" replace />
                            }
                        ],
                    },
                    // Feed
                    {
                        path: "feed",
                        element: <FeedPage />,
                    },
                    // News
                    {
                        path: "news",
                        element: <NewsLayout />,
                        children: [
                            // Posts - search
                            {
                                path: "search",
                                element: <NewsListPage mode="search" />,
                            },
                            // Posts - favorites
                            {
                                path: "favorites",
                                element: <NewsListPage mode="favorites" />,
                                private: true,
                                privateRedirectTo: "/auth/sign-in",
                            },

                            // Posts - view
                            {
                                path: "view/:id(\\d+)",
                                element: <NewsItemPage mode="view" />,
                            },
                            // Posts - create
                            {
                                path: "create",
                                element: <NewsItemPage mode="create" />,
                                private: true,
                                privateRedirectTo: "/auth/sign-in",
                            },
                            // Posts - edit
                            {
                                path: "edit/:id(\\d+)",
                                element: <NewsItemPage mode="edit" />,
                                private: true,
                                privateRedirectTo: "/auth/sign-in",
                            },

                            // Ошибка пути
                            {
                                path: "*",
                                element: <SafeNavigate to="/news/search" replace />,
                            },

                        ]
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
                                element: <UserSettingsPage />,
                            },
                            // Ошибка пути
                            {
                                path: "*",
                                element: <SafeNavigate to="/user/settings" replace />,
                            },
                        ]
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
                element: <SafeNavigate to="/error" replace />,
            }
        ],
    },
];