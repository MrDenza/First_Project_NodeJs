import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function usePageTitle(title) {
    const location = useLocation();

    useEffect(() => {
        document.title = title;
    }, [location, title]);
}