import { useSearchParams } from 'react-router-dom';

const ErrorPage = () => {
    const [searchParams] = useSearchParams();

    // Получаем параметры из URL (если их нет — ставим значения по умолчанию)
    const errorCode = searchParams.get('code') || '400';
    const errorMessage = searchParams.get('message') || 'Произошла ошибка';

    return (
        <div className="error-page">
            <h1>Ошибка {errorCode}</h1>
            <p>{decodeURIComponent(errorMessage)}</p>
            <a href="/">Вернуться на главную</a>
        </div>
    );
};

export default ErrorPage;