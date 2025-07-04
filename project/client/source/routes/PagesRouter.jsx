import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { routeConfig } from "./routes";

function renderRoutes(routes) {
    return routes.map((route, idx) => {
        const element = route.private ? (
            <ProtectedRoute redirectTo={route.privateRedirectTo}>
                {route.element}
            </ProtectedRoute>
        ) : (
            route.element
        );

        return (
            <Route key={idx} path={route.path} element={element} index={route.index}>
                {route.children && renderRoutes(route.children)}
            </Route>
        );
    });
}

export default function PagesRouter() {
    return <Routes>{renderRoutes(routeConfig)}</Routes>;
}