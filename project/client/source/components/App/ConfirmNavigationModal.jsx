import { useDispatch, useSelector } from 'react-redux';
import { clearPendingNavigation, setUnsavedChanges } from "../../redux/reducers/appSettings/appSettingsSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import './ConfirmNavigationModal.css';

const ConfirmNavigationModal = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pendingNavigation, hasUnsavedChanges} = useSelector(state => state.appSettings);

    const handleBeforeUnload = (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'У вас есть несохраненные изменения. Вы уверены, что хотите уйти?';
        }
    };

    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    const handleConfirm = () => {
        // Разрешаем навигацию
        window.removeEventListener('beforeunload', handleBeforeUnload);
        dispatch(setUnsavedChanges(false));
        if (pendingNavigation) {
            navigate(pendingNavigation);
        }
        dispatch(clearPendingNavigation());
    };

    const handleCancel = () => {
        dispatch(clearPendingNavigation());
    };

    if (!pendingNavigation) return null;

    return (
        <div className="confirm-modal">
            <div className="confirm-modal__content">
                <h2 className="confirm-modal__title">Несохраненные изменения</h2>
                <p className="confirm-modal__message">
                    У вас есть несохраненные изменения. <br />Вы уверены, что хотите уйти?<br />
                    Все несохраненные изменения будут потеряны.
                </p>
                <div className="confirm-modal__actions">
                    <button
                        className="confirm-modal__button confirm-modal__button--cancel"
                        onClick={handleCancel}
                    >
                        Отмена
                    </button>
                    <button
                        className="confirm-modal__button confirm-modal__button--confirm"
                        onClick={handleConfirm}
                    >
                        Выйти
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmNavigationModal;