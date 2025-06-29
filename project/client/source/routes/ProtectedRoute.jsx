import { useDispatch, useSelector } from "react-redux";
import SafeNavigate from '../components/routes/SafeNavigate';
import LoadingSpinner from "../components/common/LoadingSpinner/LoadingSpinner";
import { useEffect } from "react";
import { checkToken } from "../redux/reducers/userData/userDataSlice";

const ProtectedRoute = ({ children }) => {
    const dispatch = useDispatch();
    const { isAuth, accessToken, authCheckStatus } = useSelector(state => state.userData);

    useEffect(() => {
        if (accessToken) {
            dispatch(checkToken());
        }
    }, [dispatch, accessToken]);

    if (authCheckStatus === 'idle' || authCheckStatus === 'pending') {
        return <LoadingSpinner fullScreen />;
    }

    if (authCheckStatus === 'failed' || !isAuth) {
        return <SafeNavigate to="/auth/sign-in" replace />;
    }

    return children;
};

export default ProtectedRoute;