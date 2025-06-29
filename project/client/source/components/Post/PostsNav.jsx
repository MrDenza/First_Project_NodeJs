import { IoEyeSharp, IoSave } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RiDeleteBin7Fill } from "react-icons/ri";
import { memo } from "react";

const PostsNav = ({
    mode,
    viewMode,
    onToggleMode,
    isCreateMode,
    isAuthor,
    isFav,
    onFav,
    onSave,
    isOwnerOrAdmin,
    onDelete
}) => {
    const hasUnsavedChanges = useSelector((state) => state.appSettings.hasUnsavedChanges);
    const isEditingOrCreating = mode === "edit" || isCreateMode;

    return (
        <div className="posteditor-toolbar">
            {/* Переключатель предпросмотр/редактирование + редактировать в view */}
            {(isEditingOrCreating || isOwnerOrAdmin) && (
                <button
                    className="posteditor-toolbar__btn"
                    onClick={onToggleMode}
                    title={viewMode === "edit" ? "Предпросмотр" : "Редактировать"}
                    type="button"
                >
                    {viewMode === "edit" ? <IoEyeSharp size={20} /> : <MdEdit size={20} />}
                </button>
            )}

            {/* Кнопка сохранения (только в режиме редактирования) */}
            {(isEditingOrCreating) && (
                <button
                    className="posteditor-toolbar__btn"
                    onClick={onSave}
                    title="Сохранить"
                    type="button"
                    disabled={!isCreateMode && !hasUnsavedChanges}
                >
                    <IoSave size={20} />
                </button>
            )}

            {/* Кнопка удаления если не create и пользователь владелец или админ */}
            {!isCreateMode && (isOwnerOrAdmin || mode === "edit") && onDelete && (
                <button
                    className="posteditor-toolbar__btn"
                    onClick={onDelete}
                    title="Удалить пост"
                    type="button"
                    disabled={!isOwnerOrAdmin}
                >
                    <RiDeleteBin7Fill size={20} />
                </button>
            )}

            {/* Кнопка избранного если пользователь авторизован и пост существует (postId) */}
            {!isCreateMode && mode === "view" && onFav && !isAuthor && (
                <button
                    className="posteditor-toolbar__btn"
                    onClick={onFav}
                    title={isFav ? "Удалить из избранного" : "Добавить в избранное"}
                    type="button"
                >
                    {isFav ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
                </button>
            )}

            {hasUnsavedChanges && (
                <span className="posteditor-toolbar__unsaved">
                    Есть несохраненные изменения
                </span>
            )}
        </div>
    );
};

export default memo(PostsNav);