import "./DevelopedPage.css";
import { usePageTitle } from "../../../hooks/usePageTitle";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const data = {
    pageTitle: 'Раздел в разработке',
    title: 'Данный раздел находится на стадии разработки',
    description: 'Мы прикладываем все усилия чтобы порадовать Вас новыми разделами =)'
};

const DevelopedPage = () => {
    const userName = useSelector(state => state.userData.user);
    const isAdmin = useSelector(state => state.userData.isAdmin);

    usePageTitle(`${data.pageTitle} | ${import.meta.env.VITE_SITE_NAME || "Messaria"}`);

    return (
        <div className="dev-page__box" role="alert">
            <h1 className="visually-hidden">{data.title}</h1>

            <div className="dev-page">
                <div className="dev-page__text-box">
                    <h2 className="dev-page__code">{data.title}</h2>

                    <p className="dev-page__description">
                        {data.description}
                    </p>

                    <p className="dev-page__description">
                        {`Но можем по секрету сказать:`}
                    </p>

                    <p className="dev-page__description">
                        {`Твой ник - ${userName} (статус: ${isAdmin ? 'Админ' : "Пользователь"})`}
                    </p>

                    <Link
                        to="/"
                        className="dev-page__button"
                        aria-label="Вернуться на главную страницу"
                    >
                        На главную
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DevelopedPage;