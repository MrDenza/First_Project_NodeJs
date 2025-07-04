import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import { Helmet } from "react-helmet-async";

const HomePage = () => {

    return (
        <div className="home-page">
            <Helmet>
                <title>Главная страница | Messarea</title>
                <meta name="description" content="Главная страница" />
            </Helmet>
            {/* Герой-секция */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Делитесь смыслами, а не просто словами</h1>
                    <p>Создавайте посты из гибких блоков — добавляйте фото, текст и заголовки.</p>
                    <p>Находите вдохновение в работах других и собирайте свою коллекцию идей.</p>
                    <div className="hero-actions">
                        <Link to="/posts/create" className="btn-primary">Создать пост</Link>
                        <Link to="/feed" className="btn-secondary">Найти вдохновение</Link>
                    </div>
                </div>
            </section>

            {/* Описание платформы */}
            <section className="description-section">
                <div className="description-content">
                    <h2>Конструктор ваших мыслей</h2>
                    <p>Наш сервис превращает создание постов в творческий процесс:</p>
                    <ul className="features-list">
                        <li>Комбинируйте блоки как пазл</li>
                        <li>Сохраняйте понравившиеся работы в избранное</li>
                        <li>Открывайте новые темы через умный поиск</li>
                    </ul>
                    <p className="tagline">Пишите так, как думаете — без ограничений шаблонов.</p>
                </div>
            </section>

            {/* Призыв к действию */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ваша история ждёт читателей</h2>
                    <p>Начните прямо сейчас — первый пост займёт меньше 5 минут.</p>
                    <p>Делитесь опытом, находите единомышленников, собирайте обратную связь.</p>
                    <p className="quote">"Лучший способ научиться — начать делать" (с)</p>
                    <Link to="/posts/create" className="btn-primary">Создать первый пост</Link>
                </div>
            </section>

            {/* Футер */}
            <footer className="main-footer">
                <p className="footer-tagline">Место, где мысли обретают форму</p>
                <p>© 2025 Конструктор постов. Все права на идеи принадлежат их авторам.</p>
                <p className="footer-privacy">"Мы не храним ваши данные — мы помогаем вам их выразить"</p>
            </footer>
        </div>
    );
};

export default HomePage;