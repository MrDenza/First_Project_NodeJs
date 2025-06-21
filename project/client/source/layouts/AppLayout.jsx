import AppNavbar from "../components/App/AppNavbar";
import { Outlet } from "react-router-dom";
import "./AppLayout.css";
import { useDispatch, useSelector } from "react-redux";
import { checkToken, logoutUser } from "../redux/reducers/userAuth/userAuthSlice";
import { memo, useEffect } from "react";

const AppLayout = () => {
    const dispatch = useDispatch();
    const { isAuth, authCheckStatus } = useSelector(state => state.userAuth);

    useEffect(() => {
        let interval;
        let isMounted = true;

        const startInterval = () => {
            if (isMounted && isAuth && authCheckStatus !== 'logout') {
                interval = setInterval(() => {
                    console.log('проверка');
                    dispatch(checkToken());
                }, 10 * 1000);
            }
        };

        if (authCheckStatus === 'idle') {
            dispatch(checkToken());
        }

        startInterval();

        return () => {
            isMounted = false;
            if (interval) clearInterval(interval);
        };
    }, [dispatch, isAuth, authCheckStatus]);

    const logout = (eo) => {
        eo.preventDefault();
        dispatch(logoutUser());
    }

    return (
        <div className="applayout__container">
            <div className="applayout__nav">
                <AppNavbar isAuth={isAuth} logout={logout}/>
            </div>
            <main className="applayout__main">
                <Outlet />
            </main>
        </div>
    );
};

export default memo(AppLayout);