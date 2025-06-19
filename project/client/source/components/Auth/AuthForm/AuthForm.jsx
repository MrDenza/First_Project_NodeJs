import React from 'react';
import { memo, useEffect, useState } from "react";
import "./AuthForm.css";

const initialState = {
    username: import.meta.env.VITE_AUTH_NAME || "",
    email: import.meta.env.VITE_AUTH_EMAIL || "",
    password: import.meta.env.VITE_AUTH_PASS || "",
    login: import.meta.env.VITE_AUTH_LOGIN || "",
};

function generateErrList(err) {
    if (typeof err === "string") {
        return <li key={err} className="auth__error">{err}</li>;
    }

    if (React.isValidElement(err)) {
        return <li className="auth__error">{err}</li>;
    }

    if (Array.isArray(err)) {
        return err.map((msg) => generateErrList(msg));
    }

    if (err && typeof err === "object") {
        return Object.entries(err).flatMap(([_, value]) =>
            generateErrList(value)
        );
    }

    return <li className="auth__error">{String(err)}</li>;
}

function AuthForm({ mode = 'login', onSubmit , externalError, validator}) {
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validator(mode,
            {
                username: form.username,
                email: form.email,
                password: form.password,
                login: form.login,
            });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        if (mode === 'register') {
            onSubmit({
                username: form.username,
                email: form.email,
                password: form.password
            });
        } else {
            onSubmit({
                login: form.login,
                password: form.password
            });
        }
    };

    useEffect(() => {
        setForm(initialState);
        setErrors({});
    }, [mode]);

    return (
        <form onSubmit={handleSubmit} className="auth__form">
            <h2 className="auth__title">{mode === 'register' ? 'Регистрация' : 'Авторизация'}</h2>

            {mode === 'register' ? (
                <div className="auth__field-box">
                    <label htmlFor='username'>Ник пользователя</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="auth__input"
                        autoComplete="username"
                    />
                </div>
            ) : (
                <div className="auth__field-box">
                    <label htmlFor='login'>Email</label>
                    <input
                        type="text"
                        id="login"
                        name="login"
                        value={form.login}
                        onChange={handleChange}
                        className="auth__input"
                        autoComplete="username"
                    />
                </div>
            )}

            {mode === 'register' && (
                <div className="auth__field-box">
                    <label htmlFor='email'>Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="auth__input"
                        autoComplete="email"
                    />
                </div>
            )}

            <div className="auth__field-box">
                <label htmlFor="password">Пароль</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="auth__input"
                    autoComplete="current-password"
                />
            </div>

            {(Object.keys(errors).length > 0 || externalError) && (
                <>
                    <hr className="auth__divider" />
                    <ul className="auth__errors">
                        {Object.keys(errors).length > 0 && generateErrList(errors)}
                        {externalError && generateErrList(externalError)}
                    </ul>
                </>
            )}

            <button type="submit" className="auth__button">
                {mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
            </button>
        </form>
    );
}

export default memo(AuthForm);