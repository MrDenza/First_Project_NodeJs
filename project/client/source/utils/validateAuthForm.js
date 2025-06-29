function validate (mode, {username, email, password, login}) {
    // mode = 'register' или 'login'
    const errs = {};

    const usernameRegex = /^[A-Za-z0-9]{1,20}$/;
    //const loginRegex = /^[A-Za-z0-9]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

    const ERROR_MESSAGES = {
        username: {
            required: "Введите логин",
            invalid: "Логин может содержать только английские буквы и цифры, максимум 20 символов",
        },
        email: {
            required: "Введите email",
            invalid: "Некорректный email",
        },
        login: {
            required: "Введите email",
            //invalidChars: "Логин может содержать только латинские буквы и цифры",
            invalidEmail: "Некорректный email",
            tooLong: "Максимум 50 символов",
        },
        password: {
            required: "Введите пароль",
            invalid: "Пароль должен содержать минимум 8 символов, включая заглавную букву, цифру и спецсимвол",
        },
    };

    if (mode === 'register') {
        if (!username.trim()) {
            errs.username = ERROR_MESSAGES.username.required;
        } else if (!usernameRegex.test(username)) {
            errs.username = ERROR_MESSAGES.username.invalid;
        }

        if (!email.trim()) {
            errs.email = ERROR_MESSAGES.email.required;
        } else if (!emailRegex.test(email)) {
            errs.email = ERROR_MESSAGES.email.invalid;
        }
    } else {
        // В режиме login поле login — это только email
        if (!login.trim()) {
            errs.identifier = ERROR_MESSAGES.login.required;
        } else if (login.length > 50) {
            errs.identifier = ERROR_MESSAGES.login.tooLong;
        } else if (!emailRegex.test(login)) {
            errs.identifier = ERROR_MESSAGES.login.invalidEmail;
        }
    }

    // Валидация поля login, когда логином может быть username или email
    // else {
    //     if (!login.trim()) {
    //         errs.identifier = ERROR_MESSAGES.login.required;
    //     } else if (login.length > 50) {
    //         errs.identifier = ERROR_MESSAGES.login.tooLong;
    //     } else if (login.includes("@")) {
    //         if (!emailRegex.test(login)) {
    //             errs.login = ERROR_MESSAGES.login.invalidEmail;
    //         }
    //     } else {
    //         if (!loginRegex.test(login)) {
    //             errs.login = ERROR_MESSAGES.login.invalidChars;
    //         }
    //     }
    // }

    if (!password.trim()) {
        errs.password = ERROR_MESSAGES.password.required;
    } else if (mode === 'register' && !passwordRegex.test(password)) {
        errs.password = ERROR_MESSAGES.password.invalid;
    }

    return errs;
}

export default validate;