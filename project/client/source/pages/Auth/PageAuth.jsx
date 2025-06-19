import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthForm from "../../components/Auth/AuthForm/AuthForm";
import "./PageAuth.css";
import UnverifiedNotice from "../../components/Auth/UnverifiedNotice/UnverifiedNotice";
import validate from "../../utils/validateAuthForm";
import {
    regUser,
    loginUser,
    setAuthToken,
    clearError,
    resendVerification,
} from "../../redux/reducers/userData/userDataSlice";
import { memo, useEffect } from "react";
import { CLIENT_ROUTES } from "../../constants/clientRoutes";

function PageAuth({ mode }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { tempAuthToken, errAuth, isAuth, registerStatus, loginStatus, resendActStatus } = useSelector((state) => state.userData);

    // Обработка авторизации и активации
    useEffect(() => {
        if (isAuth) {
            navigate(CLIENT_ROUTES.app.home);
        } else if (loginStatus === "unactivated") {
            navigate(CLIENT_ROUTES.auth.verified);
        }
    }, [isAuth, loginStatus]);

    useEffect(() => {
        if (registerStatus === "registered") {
            navigate(CLIENT_ROUTES.auth.verified);
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
                to = CLIENT_ROUTES.auth.login;
                break;
            case "login":
                to = CLIENT_ROUTES.auth.register;
                break;
            case "verified":
                to = CLIENT_ROUTES.auth.login;
                break;
        }
        navigate(to);
    };

    useEffect(() => {
        const token = localStorage.getItem("tempAuthToken");
        if (token) dispatch(setAuthToken(token));
        if (mode === "verified" && !token) navigate(CLIENT_ROUTES.auth.login);
    }, []);

    return (
        <div className="auth__container">
            {(mode === "register" || mode === "login") && (
                <AuthForm
                    mode={mode}
                    onSubmit={handleSubmit}
                    validator={validate}
                    externalError={errAuth ? errAuth : ""}
                />
            )}
            {mode === "verified" && (
                <UnverifiedNotice
                    onResend={handleResend}
                    isLoading={resendActStatus === "pending"}
                    isSend={resendActStatus === "shipped"}
                    hasToken={!!tempAuthToken}
                    error={errAuth}
                />
            )}
            <button
                className="auth__button"
                onClick={() => handleSwitchMode(mode)}
            >
                {mode === "register" && "Уже есть аккаунт? Войти"}
                {mode === "login" && "Нет аккаунта? Зарегистрироваться"}
                {mode === "verified" && "Подтвердил почту? Авторизация"}
            </button>
        </div>
    );
}

export default memo(PageAuth);