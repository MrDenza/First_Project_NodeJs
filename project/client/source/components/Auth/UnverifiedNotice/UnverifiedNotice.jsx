import { useEffect, useState } from "react";
import "./UnverifiedNotice.css";

export default function UnverifiedNotice({ onResend, isLoading, isSend, hasToken, error }) {
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (isSend) {
            setCooldown(60);
            const timer = setInterval(() => {
                setCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isSend]);

    const getButtonState = () => {
        if (!hasToken) {
            return {
                disabled: true,
                text: "Требуется авторизация",
                hint: "Время сессии истекло. Авторизуйтесь снова.",
            };
        }
        if (isLoading) {
            return {
                disabled: true,
                text: "Отправка...",
            };
        }
        if (cooldown > 0) {
            return {
                disabled: true,
                text: `Повтор через ${cooldown} сек`,
            };
        }
        if (error) {
            return {
                disabled: false,
                text: "Повторить отправку",
                hint: error,
            };
        }
        return {
            disabled: false,
            text: "Отправить письмо повторно",
        };
    };

    const buttonState = getButtonState();

    return (
        <div className="auth__unverified">
            <p>Аккаунт не активирован. Проверьте почту и подтвердите регистрацию.</p>
            {buttonState.hint && <p className="auth__error-resend">{buttonState.hint}</p>}
            <button
                type="button"
                onClick={onResend}
                disabled={buttonState.disabled}
                className="auth__resend-button"
            >
                {buttonState.text}
            </button>
        </div>
    );
}