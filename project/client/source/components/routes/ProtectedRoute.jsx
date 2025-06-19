import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from '../../redux/reducers/userData/userDataSlice';
import SafeNavigate from "./SafeNavigate";

const ProtectedRoute = ({ children, redirectTo }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuth, accessToken } = useSelector(state => state.userData);

    const didInit = useRef(false);

    useEffect(() => {
        if (!didInit.current) {
            didInit.current = true;
            if (accessToken) return;
        }
        if (!isAuth) {
            dispatch(checkAuth())
            .unwrap()
            .catch(() => navigate(redirectTo, { replace: true }));
        }
    }, [isAuth, dispatch, navigate, accessToken]);

    return isAuth ? children : <SafeNavigate to={redirectTo} />;
};

export default ProtectedRoute;
