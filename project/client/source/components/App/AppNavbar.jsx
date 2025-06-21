import "./AppNavbar.css";
import { icon } from "../../elements/svgIcon";
import { Link, useLocation } from "react-router-dom";
import { memo } from "react";

const AppNavbar = ({ isAuth, logout }) => {
    const location = useLocation();

    const navItems = [
        { path: "/feed", icon: icon.home, label: "Главная" },
        { path: "/news/search", icon: icon.lens, label: "Поиск новостей" },
        ...(isAuth ? [
            { path: "/news/favorites", icon: icon.notepad, label: "Избранное" },
            { path: "/news/create", icon: icon.pencil, label: "Создать новость" }
        ] : [])
    ];

    return (
        <nav className="appnavbar__container" aria-label="Основная навигация">
            <Link to="/" className="appnavbar__link-logo" aria-label="На главную">
                <span role="img" aria-hidden="true">{icon.logo}</span>
            </Link>

            <ul className="appnavbar__user-btn-box">
                {navItems.map((item) => (
                    <li key={item.path}>
                        <Link
                            to={item.path}
                            aria-current={location.pathname === item.path ? "page" : undefined}
                            title={item.label}
                        >
                            <span role="img" aria-label={item.label}>{item.icon}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="appnavbar__user-box">
                {isAuth ? (
                    <>
                        <Link
                            to="/auth/logout"
                            className="appnavbar__btn-quit"
                            onClick={logout}
                            title="Выйти"
                        >
                            <span role="img" aria-label="Выйти">{icon.quit}</span>
                        </Link>
                        <Link
                            to="/user/settings"
                            className="appnavbar__btn-user"
                            title="Настройки профиля"
                        >
                            <span role="img" aria-label="Профиль">{icon.user}</span>
                        </Link>
                    </>
                ) : (
                    <Link
                        to="/auth/sign-in"
                        className="appnavbar__btn-user"
                        title="Войти"
                    >
                        <span role="img" aria-label="Войти">{icon.user}</span>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default memo(AppNavbar);