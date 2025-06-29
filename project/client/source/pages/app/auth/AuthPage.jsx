import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthForm from "../../../components/Auth/AuthForm/AuthForm";
import "./AuthPage.css";
import UnverifiedNotice from "../../../components/Auth/UnverifiedNotice/UnverifiedNotice";
import validate from "../../../utils/validateAuthForm";
import {
    regUser,
    loginUser,
    setAuthToken,
    clearError,
    resendVerification,
} from "../../../redux/reducers/userData/userDataSlice";
import { memo, useEffect } from "react";
import { usePageTitle } from "../../../hooks/usePageTitle";

const pageTitles = {
    login: "Вход в систему",
    register: "Регистрация",
    verified: "Подтверждение email"
};

const metaDescription = {
    login: "Войдите в свой аккаунт для доступа к персональным данным",
    register: "Зарегистрируйте новый аккаунт для получения полного доступа",
    verified: "Подтвердите ваш email для завершения регистрации"
};

function AuthPage({ mode }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { tempAuthToken, errAuth, isAuth, registerStatus, loginStatus, resendActStatus } = useSelector((state) => state.userData);

    usePageTitle(`${pageTitles[mode]} | ${import.meta.env.VITE_SITE_NAME || "Messaria"}`);

    // SEO
    useEffect(() => {
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) {
            descriptionMeta.content = metaDescription[mode];
        } else {
            const meta = document.createElement('meta');
            meta.name = "description";
            meta.content = metaDescription[mode];
            document.head.appendChild(meta);
        }

        // Канонический URL
        const canonicalUrl = `${window.location.origin}/auth/${mode === 'login' ? 'sign-in' : mode === 'register' ? 'sign-up' : 'verified'}`;
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = "canonical";
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = canonicalUrl;

        dispatch(clearError(true));
    }, [mode, dispatch]);

    // Обработка авторизации и активации
    useEffect(() => {
        if (isAuth) {
            navigate("/feed");
        } else if (loginStatus === "unactivated") {
            navigate("/auth/verified");
        }
    }, [isAuth, loginStatus]);

    useEffect(() => {
        if (registerStatus === "registered") {
            navigate("/auth/verified");
        }
    }, [registerStatus]);

    const handleSubmit = async (data) => {
        const action = mode === "register" ? regUser(data) : loginUser(data);
        await dispatch(action);
    };

    const handleResend = async () => {
        await dispatch(resendVerification());
    };

    const handleSwitchMode = () => {
        dispatch(clearError(true));
        let to;
        switch (mode) {
            case "register":
                to = "/auth/sign-in";
                break;
            case "login":
                to = "/auth/sign-up";
                break;
            case "verified":
                to = "/auth/sign-in";
                break;
            default:
                to = "/auth/sign-in";
        }
        navigate(to);
    };

    useEffect(() => {
        const token = localStorage.getItem("tempAuthToken");
        if (token) dispatch(setAuthToken(token));
        if (mode === "verified" && !token) navigate("/auth/sign-in");
    }, [mode, dispatch, navigate]);

    const getSchemaMarkup = () => {
        return {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": document.title,
            "description": document.querySelector('meta[name="description"]')?.content,
            "url": window.location.href
        };
    };

    return (
        <>
            <script type="application/ld+json">
                {JSON.stringify(getSchemaMarkup())}
            </script>

            <main className="auth__container" itemScope itemType="https://schema.org/WebPage">
                <h1 className="visually-hidden">{document.title}</h1>

                {(mode === "register" || mode === "login") && (
                    <section itemScope itemType="https://schema.org/Form">
                        <AuthForm
                            mode={mode}
                            onSubmit={handleSubmit}
                            validator={validate}
                            externalError={errAuth ? errAuth : ""}
                        />
                    </section>
                )}

                {mode === "verified" && (
                    <section itemScope itemType="https://schema.org/ConfirmAction">
                        <UnverifiedNotice
                            onResend={handleResend}
                            isLoading={resendActStatus === "pending"}
                            isSend={resendActStatus === "shipped"}
                            hasToken={!!tempAuthToken}
                            error={errAuth}
                        />
                    </section>
                )}

                <button
                    className="auth__button"
                    onClick={() => handleSwitchMode(mode)}
                    aria-label={
                        mode === "register" ? "Перейти к странице входа" :
                            mode === "login" ? "Перейти к странице регистрации" :
                                "Перейти к странице авторизации"
                    }
                >
                    {mode === "register" && "Уже есть аккаунт? Войти"}
                    {mode === "login" && "Нет аккаунта? Зарегистрироваться"}
                    {mode === "verified" && "Подтвердил почту? Авторизация"}
                </button>
            </main>
        </>
    );
}

export default memo(AuthPage);