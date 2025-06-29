import { Link, useSearchParams } from "react-router-dom";
import "./ErrorPage.css";
import { icon } from "../../../elements/svgIcon";
import { usePageTitle } from "../../../hooks/usePageTitle";

const sanitizeText = (str) => {
    if (!str) return '';
    return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const errorMessages = {
    '400': {
        title: 'Ошибка 400 - Неверный запрос',
        description: 'Сервер не может обработать ваш запрос из-за некорректного синтаксиса.'
    },
    '401': {
        title: 'Ошибка 401 - Требуется авторизация',
        description: 'Для доступа к этой странице необходимо войти в систему.'
    },
    '403': {
        title: 'Ошибка 403 - Доступ запрещён',
        description: 'У вас нет прав для просмотра этой страницы.'
    },
    '404': {
        title: 'Ошибка 404 - Страница не найдена',
        description: 'Запрошенная страница не существует или была перемещена.'
    },
    '500': {
        title: 'Ошибка 500 - Ошибка сервера',
        description: 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.'
    }
};

const ErrorPage = () => {
    const [searchParams] = useSearchParams();

    const errorCode = sanitizeText(searchParams.get('code')) || '404';
    const customMessage = searchParams.get('message');

    const { title, description } = errorMessages[errorCode] || errorMessages['404'];
    const safeCustomMessage = customMessage
        ? sanitizeText(decodeURIComponent(customMessage))
        : null;

    usePageTitle(`${title} | ${import.meta.env.VITE_SITE_NAME || "Messaria"}`);

    return (
        <div className="error-page__box" role="alert">
            <h1 className="visually-hidden">{title}</h1>

            <div className="error-page">
                <div className="error-page__icon" aria-hidden="true">
                    {icon.error || '⚠️'}
                </div>

                <div className="error-page__text-box">
                    <h2 className="error-page__code">Ошибка {errorCode}</h2>

                    <p className="error-page__description">
                        {safeCustomMessage || description}
                    </p>

                    <Link
                        to="/"
                        className="error-page__button"
                        aria-label="Вернуться на главную страницу"
                    >
                        На главную
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;