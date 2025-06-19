// import { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
//
// export const LoadDataRoute = ({ element, loadData }) => {
//     const dispatch = useDispatch();
//     const location = useLocation();
//
//     useEffect(() => {
//         if (loadData) {
//             dispatch(loadData());
//         }
//     }, [dispatch, loadData, location.key]);
//
//     return element;
// };