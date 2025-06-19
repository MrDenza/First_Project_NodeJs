import "./App.css";
import PagesRouter from "./routes/PagesRouter";

function App() {

    return (
        <div className="container">
            <div className="app__box">
                <PagesRouter/>
            </div>
        </div>
    );
}

// App.fetchData = (store, params) => {
//     // вызываем thunk через dispatch и возвращаем Promise
//     //return store.dispatch(loginUser());
// };

export default App;