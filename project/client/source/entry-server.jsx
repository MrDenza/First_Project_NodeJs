import { StaticRouter } from "react-router-dom/server";
import { Provider } from "react-redux";
import { createStore } from "./redux/store";
import App from "./App";
import { matchRoutes } from "react-router-dom";
import { routeConfig } from "./routes/routes";
import { createContext, useContext } from "react";

export async function createApp(req, context) {
    const store = createStore({}, req);

    async function loadDataForMatchedRoutes(url, store) {
        const matchedRoutes = matchRoutes(routeConfig, url);
        console.log("Выполняется SSR - ",url);

        // вызов ssrLoadData из маршрутов
        const promisesFromRoutes = matchedRoutes
            .filter(({ route }) => route.ssrLoadData)
            .map(({ route }) => store.dispatch(route.ssrLoadData()));

        // вызов fetchData из компонентов
        const promisesFromComponents = [];

        matchedRoutes.forEach(({ route, params }) => {
            const Component = route.element?.type; // если route.element — React элемент
            if (Component && Component.fetchData) {
                promisesFromComponents.push(Component.fetchData(store, params));
            }
        });

        await Promise.all([...promisesFromRoutes, ...promisesFromComponents]);
    }
    await loadDataForMatchedRoutes(req.originalUrl, store);

    context.preloadedState = store.getState();

    return (
        <SSRContext.Provider value={context}>
            <Provider store={store}>
                <StaticRouter location={req.originalUrl} context={context}>
                    <App />
                </StaticRouter>
            </Provider>
        </SSRContext.Provider>
    );
}

export const SSRContext = createContext(null);

export function useSSRContext() {
    return useContext(SSRContext);
}