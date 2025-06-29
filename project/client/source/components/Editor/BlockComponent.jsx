import React, { memo, useEffect, useRef, useState } from "react";
import TextBlock from "./Blocks/TextBlock";
import HeadingBlock from "./Blocks/HeadingBlock";
import ImageBlock from "./Blocks/ImageBlock";
import { IoSettings } from "react-icons/io5";
import { FaGripLines } from "react-icons/fa";
import { RiDeleteBin7Fill } from "react-icons/ri";
import "./BlockComponent.css";

const BlockComponent = ({
    block,
    index,
    onDragStart,
    deleteBlock,
    blockRefs,
    onDragEnd,
    onChange
}) => {
    let Comp;
    if (block.type === 'text') Comp = TextBlock;
    else if (block.type === 'heading') Comp = HeadingBlock;
    else if (block.type === 'image') Comp = ImageBlock;
    else return null;

    const [isLocalDragging, setIsLocalDragging] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const dragHandleRef = useRef(null);

    const handleDragStart = (e) => {
        setIsLocalDragging(true);
        onDragStart(index);
    };

    const handleDragEnd = (e) => {
        setIsLocalDragging(false);
        onDragEnd();
    };

    const handleDeleteConfirm = () => {
        deleteBlock(block.id);
        setShowDeleteModal(false);
    };

    useEffect(() => {
        if (dragHandleRef.current) {
            dragHandleRef.current.classList.toggle('blockcomp--dragging', isLocalDragging);
        }
    }, [isLocalDragging]);

    return (
        <div
            ref={dragHandleRef}
            className="blockcomp"
        >
            <div className="blockcomp__container">
                <div className="blockcomp__controls">
                    <div
                        draggable
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className="blockcomp__drag-handle"
                        title="Переместить блок"
                    >
                        <FaGripLines />
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`blockcomp__settings-btn ${isSettingsOpen ? 'blockcomp__settings-btn--active' : ''}`}
                        title={isSettingsOpen ? "Скрыть настройки" : "Показать настройки"}
                    >
                        <IoSettings />
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="blockcomp__delete-btn"
                        title="Удалить блок"
                    >
                        <RiDeleteBin7Fill />
                    </button>
                </div>

                <div id={`blockEditor-${block.id}`} className="blockcomp__content">
                    <Comp
                        ref={(el) => (blockRefs.current[block.id] = el)}
                        block={block}
                        showSettings={isSettingsOpen}
                        onChange={onChange}
                    />
                    {showDeleteModal && (
                        <div className="blockcomp__modal-overlay">
                            <div className="blockcomp__modal">
                                <h4 className="blockcomp__modal-title">Подтверждение удаления</h4>
                                <p className="blockcomp__modal-text">Вы уверены, что хотите удалить этот блок?</p>

                                <div className="blockcomp__modal-buttons">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="blockcomp__modal-btn blockcomp__modal-btn--cancel"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeleteConfirm}
                                        className="blockcomp__modal-btn blockcomp__modal-btn--confirm"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(BlockComponent);