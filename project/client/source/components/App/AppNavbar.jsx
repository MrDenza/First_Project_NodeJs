import "./AppNavbar.css";
import { icon } from "../../elements/svgIcon";
import { Link, useLocation } from "react-router-dom";
import { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPendingNavigation } from "../../redux/reducers/appSettings/appSettingsSlice";

const AppNavbar = ({ isAuth }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const hasUnsavedChanges = useSelector(state => state.appSettings.hasUnsavedChanges);

    const navItems = [
        { path: "/feed", icon: icon.home, label: "Главная" },
        { path: "/posts/search", icon: icon.lens, label: "Поиск новостей" },
        ...(isAuth ? [
            { path: "/posts/favorites", icon: icon.notepad, label: "Избранное" },
            { path: "/posts/create", icon: icon.pencil, label: "Создать новость" }
        ] : [])
    ];

    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    // Обработчик для всех защищенных ссылок
    const handleProtectedClick = (path) => (e) => {
        if (isActivePath(path)) {
            e.preventDefault();
            return;
        }
        if (hasUnsavedChanges) {
            e.preventDefault();
            dispatch(setPendingNavigation(path));
        }
        // Если нет изменений - переход произойдет как обычно
    };

    return (
        <nav className="appnavbar__container" aria-label="Основная навигация">
            {/* Логотип */}
            <Link
                to="/"
                className={`appnavbar__link-logo`}
                aria-label="На главную"
                onClick={handleProtectedClick("/")}
            >
                <span role="img" aria-hidden="true">{icon.logo}</span>
            </Link>

            {/* Основные навигационные ссылки */}
            <ul className="appnavbar__user-btn-box">
                {navItems.map((item) => (
                    <li key={item.path}>
                        <Link
                            to={item.path}
                            className={isActivePath(item.path) ? "appnavbar__active-btn" : ""}
                            aria-current={isActivePath(item.path) ? "page" : undefined}
                            title={item.label}
                            onClick={handleProtectedClick(item.path)}
                        >
                            <span role="img" aria-label={item.label}>{item.icon}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            {/* Блок пользователя */}
            <div className="appnavbar__user-box">
                {isAuth ? (
                    <>
                        <Link
                            to="/auth/logout"
                            className={`appnavbar__btn-quit`}
                            onClick={(e) => {
                                handleProtectedClick("/auth/logout")(e);
                            }}
                            title="Выйти"
                        >
                            <span role="img" aria-label="Выйти">{icon.quit}</span>
                        </Link>
                        <Link
                            to="/user/settings"
                            className={`appnavbar__btn-user`}
                            title="Настройки профиля"
                            onClick={handleProtectedClick("/user/settings")}
                        >
                            <span role="img" aria-label="Профиль">{icon.user}</span>
                        </Link>
                    </>
                ) : (
                    <Link
                        to="/auth/sign-in"
                        className={`appnavbar__btn-user`}
                        title="Войти"
                        onClick={handleProtectedClick("/auth/sign-in")}
                    >
                        <span role="img" aria-label="Войти">{icon.user}</span>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default memo(AppNavbar);