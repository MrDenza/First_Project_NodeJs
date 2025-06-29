import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react";
import AddMenu from "./AddMenu";
import BlockComponent from "./BlockComponent";
import { generateUUID } from "../../utils/generateUuid";
import './ListBlock.css';
import useDeepCompareEffect from "../../hooks/useDeepCompareEffect";

const ListBlock = forwardRef(({ initialBlocks, onChange }, ref) => {
    const blockRefs = useRef({});
    const isFirstRender = useRef(true);

    const [blocks, setBlocks] = useState(initialBlocks || []);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dropTarget, setDropTarget] = useState({ index: null, position: null });
    const [isEmptyError, setIsEmptyError] = useState(false);

    useDeepCompareEffect(() => {
        onChange();
    }, [blocks]);

    // Синхронизация с входящими пропсами initialBlocks
    useEffect(() => {
        if (initialBlocks && JSON.stringify(initialBlocks) !== JSON.stringify(blocks)) {
            setBlocks(initialBlocks);
        }
    }, [initialBlocks]);

    useImperativeHandle(ref, () => ({
        validateAllBlocks() {
            if (blocks.length === 0) {
                setIsEmptyError(true);
                return false;
            }

            setIsEmptyError(false);
            return Object.entries(blockRefs.current).every(([_, blockRef]) => {
                return blockRef?.validate?.() !== false;
            });
        },
        getAllBlocks() {
            const updatedBlocks = blocks.map(block => {
                const blockRef = blockRefs.current[block.id];
                if (blockRef && blockRef.getContent) {
                    return {
                        ...block,
                        ...blockRef.getContent()
                    };
                }
                return block;
            });

            setBlocks(updatedBlocks);
            return updatedBlocks;
        }
    }));

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (blocks.length === 0) {
            setIsEmptyError(true);
        } else {
            setIsEmptyError(false);
        }
    }, [blocks]);

    const handleAddBlock = (index, type) => {
        const newBlock = {
            id: generateUUID(),
            type,
            content: '',
        };
        const newBlocks = [...blocks];
        newBlocks.splice(index, 0, newBlock);
        setBlocks(newBlocks);
        setIsEmptyError(false);
    };

    const handleDeleteBlock = (id) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
        setDropTarget({ index: null, position: null });
    };

    const handleDrop = () => {
        if (draggedIndex === null || dropTarget.index === null) return;

        let adjustedDropIndex = dropTarget.position === 'top'
            ? dropTarget.index
            : dropTarget.index + 1;

        if (adjustedDropIndex === draggedIndex ||
            adjustedDropIndex === draggedIndex + 1) {
            return;
        }

        const updated = [...blocks];
        const [moved] = updated.splice(draggedIndex, 1);
        updated.splice(adjustedDropIndex, 0, moved);
        setBlocks(updated);
        setDraggedIndex(null);
        setDropTarget({ index: null, position: null });
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || index === draggedIndex) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const position = y < rect.height / 2 ? 'top' : 'bottom';

        setDropTarget({ index, position });
    };

    const handleDragLeave = () => {
        setDropTarget({ index: null, position: null });
    };

    const handleDragEnd = () => {
        if (draggedIndex !== null && dropTarget.index !== null) {
            const dropIndex = dropTarget.position === 'top'
                ? dropTarget.index
                : dropTarget.index + 1;
            handleDrop(dropIndex);
        }
        setDraggedIndex(null);
        setDropTarget({ index: null, position: null });
    };

    return (
        <div
            onDragEnd={handleDragEnd}
            className="listblock__container"
        >
            <div className="listblock__add-menu-wrapper">
                <AddMenu index={0} onAdd={handleAddBlock} />
            </div>

            {isEmptyError && (
                <div className="listblock__error">
                    Нельзя сохранить пустое содержимое статьи. Добавьте хотя бы один блок.
                </div>
            )}

            {blocks.map((block, index) => (
                <React.Fragment key={block.id}>
                    <div
                        className="listblock__block-wrapper"
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                    >
                        {dropTarget.index === index && dropTarget.position === 'top' && (
                            <div className="listblock__drop-indicator listblock__drop-indicator--top" />
                        )}

                        {dropTarget.index === index && (
                            <div className="listblock__drop-zone" />
                        )}
                            <BlockComponent
                                block={block}
                                index={index}
                                onDragStart={handleDragStart}
                                deleteBlock={handleDeleteBlock}
                                blockRefs={blockRefs}
                                onDragEnd={handleDragEnd}
                                onChange={onChange}
                            />
                        {dropTarget.index === index && dropTarget.position === 'bottom' && (
                            <div className="listblock__drop-indicator listblock__drop-indicator--bottom" />
                        )}
                    </div>

                    <div className="listblock__add-menu-wrapper">
                        <AddMenu index={index + 1} onAdd={handleAddBlock} />
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
});

export default memo(ListBlock);