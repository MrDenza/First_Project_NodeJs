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

function AuthPage({ mode }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { tempAuthToken, errAuth, isAuth, registerStatus, loginStatus, resendActStatus } = useSelector((state) => state.userData);

    usePageTitle(`${pageTitles[mode]} | ${import.meta.env.VITE_SITE_NAME || "Messaria"}`);

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

    return (
        <>
            <main className="auth__container">
                <h1 className="visually-hidden">{document.title}</h1>

                {(mode === "register" || mode === "login") && (
                    <section>
                        <AuthForm
                            mode={mode}
                            onSubmit={handleSubmit}
                            validator={validate}
                            externalError={errAuth ? errAuth : ""}
                        />
                    </section>
                )}

                {mode === "verified" && (
                    <section>
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