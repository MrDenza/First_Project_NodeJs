import { StaticRouter } from "react-router-dom/server";
import { Provider } from "react-redux";
import { createStore } from "./redux/store";
import App from "./App";
import { matchRoutes } from "react-router-dom";
import { routeConfig } from "./routes/routes";
import { createContext, useContext } from "react";
import { HelmetProvider } from "react-helmet-async";

export async function createApp(req, context) {
    const store = createStore({}, req);
    const helmetContext = {};

    async function loadDataForMatchedRoutes(url, store) {
        const matchedRoutes = matchRoutes(routeConfig, url);
        console.log("Выполняется SSR - ",url);

        // вызов ssrLoadData из маршрутов
        const promisesFromRoutes = matchedRoutes
        .filter(({ route }) => route.ssrLoadData)
        .map(({ route, params }) => {
            return store.dispatch(route.ssrLoadData(params))
            .catch((error) => {
                console.error("Ошибка при загрузке данных для SSR:", error);
                return Promise.resolve();
            });
        });

        // вызов fetchData из компонентов
        const promisesFromComponents = [];

        matchedRoutes.forEach(({ route, params }) => {
            const Component = route.element?.type;
            if (Component && Component.fetchData) {
                promisesFromComponents.push(
                    Component.fetchData(store, params)
                    .catch((error) => {
                        console.error("Ошибка при загрузке данных компонента:", error);
                        return Promise.resolve();
                    })
                );
            }
        });

        await Promise.all([...promisesFromRoutes, ...promisesFromComponents]);
    }
    await loadDataForMatchedRoutes(req.originalUrl, store);

    context.preloadedState = store.getState();

    context.helmetContext = helmetContext;

    return (
        <SSRContext.Provider value={context}>
            <HelmetProvider context={helmetContext}>
                <Provider store={store}>
                    <StaticRouter location={req.originalUrl} context={context}>
                        <App />
                    </StaticRouter>
                </Provider>
            </HelmetProvider>
        </SSRContext.Provider>
    );
}

export const SSRContext = createContext(null);

export function useSSRContext() {
    return useContext(SSRContext);
}