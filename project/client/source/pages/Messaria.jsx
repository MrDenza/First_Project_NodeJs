import { Link } from "react-router-dom";


const MessariaPage = () => {

    return (
        <div className="error-page">
            <h1>Добро пожаловать</h1>
            <Link to={'/messaria'}>тык</Link>
        </div>
    );
};

export default MessariaPage;