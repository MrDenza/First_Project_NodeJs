import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect, memo } from "react";
import './MetaBlock.css';
import useDeepCompareEffect from "../../../hooks/useDeepCompareEffect";

const MetaBlock = forwardRef(({ initialMeta, onChange }, ref) => {
    const titleRef = useRef();
    const descriptionRef = useRef();
    const keywordsRef = useRef();
    const [localMeta, setLocalMeta] = useState({
        title: initialMeta?.title || '',
        description: initialMeta?.description || '',
        keywords: initialMeta?.keywords || '',
    });
    const [errors, setErrors] = useState({
        title: false,
        description: false,
        keywords: false,
    });

    useDeepCompareEffect(() => {
        onChange();
    }, [localMeta]);

    useEffect(() => {
        setLocalMeta({
            title: initialMeta?.title || '',
            description: initialMeta?.description || '',
            keywords: initialMeta?.keywords || '',
        });
        setErrors({ title: false, description: false, keywords: false });
    }, [initialMeta]);

    const onUpdate = (updatedFields) => {
        setLocalMeta(prev => ({
            ...prev,
            ...updatedFields
        }));
    };

    useImperativeHandle(ref, () => ({
        validateMeta() {
            const newErrors = {
                title: !localMeta.title.trim(),
                description: !localMeta.description.trim(),
                keywords: !localMeta.keywords.trim(),
            };
            setErrors(newErrors);

            if (newErrors.title) {
                titleRef.current.focus();
                return false;
            }
            if (newErrors.description) {
                descriptionRef.current.focus();
                return false;
            }
            if (newErrors.keywords) {
                keywordsRef.current.focus();
                return false;
            }
            return true;
        },
        getMeta() {
            return {...localMeta}
        },
    }));

    return (
        <div className="metablock">
            <div className="metablock__field">
                <label className="metablock__label">
                    Заглавие*
                    <input
                        ref={titleRef}
                        type="text"
                        name="title"
                        value={localMeta.title}
                        onChange={e => onUpdate({ title: e.target.value })}
                        className={`metablock__input ${errors.title ? 'metablock__input--error' : ''}`}
                        placeholder="Заглавие статьи"
                    />
                </label>
                {errors.title && <div className="metablock__error">Поле обязательно для заполнения (заглавие статьи).</div>}
            </div>

            <div className="metablock__field">
                <label className="metablock__label">
                    Meta description*
                    <textarea
                        name="description"
                        ref={descriptionRef}
                        value={localMeta.description}
                        onChange={e => onUpdate({ description: e.target.value })}
                        className={`metablock__textarea ${errors.description ? 'metablock__textarea--error' : ''}`}
                        placeholder="Короткое описание для поисковых систем"
                    />
                </label>
                {errors.description && <div className="metablock__error">Поле обязательно для заполнения (короткое описание статьи).</div>}
            </div>

            <div className="metablock__field">
                <label className="metablock__label">
                    Meta keywords*
                    <input
                        ref={keywordsRef}
                        type="text"
                        name="keywords"
                        value={localMeta.keywords}
                        onChange={e => onUpdate({ keywords: e.target.value })}
                        className={`metablock__input ${errors.keywords ? 'metablock__input--error' : ''}`}
                        placeholder="Ключевые слова через запятую"
                    />
                </label>
                {errors.keywords && <div className="metablock__error">Поле обязательно для заполнения (ключевые слова через запятую).</div>}
            </div>
        </div>
    );
});

export default memo(MetaBlock);