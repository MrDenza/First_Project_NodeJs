import PageAuth from "../pages/Auth/PageAuth";
import SafeNavigate from "../components/routes/SafeNavigate";
import { Outlet } from "react-router-dom";
import { CLIENT_ROUTES } from "../constants/clientRoutes";
import ErrorPage from "../pages/ErrorPage";
import { checkAuth } from "../redux/reducers/userData/userDataSlice";
import MessariaPage from "../pages/Messaria";

function relativePath(fullPath, basePath) {
    if (basePath === undefined) {
        // Если передан только fullPath, удаляем ведущий слэш
        return fullPath.replace(/^\//, "");
    } else {
        // Если переданы оба аргумента
        if (fullPath.startsWith(basePath)) {
            return fullPath.slice(basePath.length).replace(/^\//, "");
        }
        return fullPath;
    }
}

export const routeConfig = [
    {
        path: CLIENT_ROUTES.all,
        element: <Outlet />,
        children: [
            {
                path: relativePath(CLIENT_ROUTES.auth.base),
                element: <Outlet />,
                children: [
                    {
                        path: relativePath(CLIENT_ROUTES.auth.login, CLIENT_ROUTES.auth.base),
                        element: <PageAuth mode="login" />,
                    },
                    {
                        path: relativePath(CLIENT_ROUTES.auth.register, CLIENT_ROUTES.auth.base),
                        element: <PageAuth mode="register" />,
                    },
                    {
                        path: relativePath(CLIENT_ROUTES.auth.verified, CLIENT_ROUTES.auth.base),
                        element: <PageAuth mode="verified" />,
                    },
                ],
            },
            {
                path: relativePath(CLIENT_ROUTES.app.home),
                element: <MessariaPage/>,
                private: true,
                privateRedirectTo: CLIENT_ROUTES.auth.login,
                ssrLoadData: () => checkAuth(), // Thunk
            },
            {
                path: relativePath(CLIENT_ROUTES.error),
                element: <ErrorPage/>,
            },
            {
                path: CLIENT_ROUTES.all, // любая ошибочная страница отправляет на авторизацию
                element: <SafeNavigate to={CLIENT_ROUTES.auth.login} replace />,
            },
        ],
    },
];

// path – путь маршрута (например, полный "auth/sign-in", разложенный если есть children "home">"albums", *);
// element – компонент, который будет отрисован по этому маршруту;
// private – если true, маршрут считается приватным и требует авторизации;
// privateRedirectTo – путь, на который перенаправляется пользователь, если он не авторизован;
// ---publicRedirectTo – используется для публичных маршрутов, если нужно сделать редирект;
// children – вложенные маршруты (подмаршруты), также могут содержать те же поля;