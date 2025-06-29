import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from "../../../redux/reducers/userData/userDataSlice";
import SafeNavigate from "../../../components/routes/SafeNavigate";

const AuthLogout = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(logoutUser());
    }, [dispatch]);

    return <SafeNavigate to="/"/>;
};

export default AuthLogout;