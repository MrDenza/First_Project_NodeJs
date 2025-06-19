import { Navigate } from "react-router-dom";
import { useSSRContext } from "../../entry-server";

export default function SafeNavigate({ to }) {
    const context = useSSRContext()
    if (typeof window === "undefined") {
        context.url = to;
        return null;
    }
    return <Navigate to={to} replace />;
}