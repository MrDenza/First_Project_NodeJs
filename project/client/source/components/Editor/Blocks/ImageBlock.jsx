import React, { useState, useImperativeHandle, forwardRef, useRef, useCallback, useMemo, memo } from "react";
import {
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
} from "react-icons/fa";
import { MdVerticalAlignTop, MdVerticalAlignBottom } from "react-icons/md";
import { RxBorderAll, RxBorderStyle } from "react-icons/rx";
import { MdOutlineSubtitles, MdOutlineSubtitlesOff } from "react-icons/md";
import { GiResize } from "react-icons/gi";
import { BsBorderWidth } from "react-icons/bs";
import { BiBorderRadius } from "react-icons/bi";
import './ImageBlock.css';
import useDeepCompareEffect from "../../../hooks/useDeepCompareEffect";
import { useDispatch } from "react-redux";
import { addImage } from "../../../redux/reducers/postsData/postsDataSlice";
import { saveToIndexedDB } from "../../../utils/db";
import { getImageSrc } from "../../../utils/imageSrc";

const DEFAULT_FORMATTING = {
    showAlt: false,
    alignment: 'left',
    useBorder: false,
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: '#cccccc',
    useBorderRadius: false,
    borderRadius: 0,
    useResize: false,
    size: 100,
    useMarginTop: false,
    marginTop: 0,
    useMarginBottom: false,
    marginBottom: 0,
};

const alignOptions = [
    { value: 'left', icon: <FaAlignLeft />, title: 'Прижать к левому краю' },
    { value: 'center', icon: <FaAlignCenter />, title: 'Выровнять по центру' },
    { value: 'right', icon: <FaAlignRight />, title: 'Прижать к правому краю' }
];

const borderStyleOptions = [
    { value: 'solid', label: 'Сплошная' },
    { value: 'dashed', label: 'Пунктир' },
    { value: 'dotted', label: 'Точки' },
    { value: 'double', label: 'Двойная' }
];

const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
const acceptString = supportedFormats.join(',');

const ImageBlock = forwardRef(({ block, onChange, showSettings }, ref) => {
    const dispatch = useDispatch();
    const altRef = useRef();
    const fileNameRef = useRef();
    const fileInputRef = useRef();

    const getInitialDataFile = useCallback(() => ({
        content: block.content || '',
        data: {
            alt: block.data?.alt || '',
            fileName: block.data?.fileName || null,
            fileType: block.data?.fileType || null,
            fileSize: block.data?.fileSize || null,
            fileKey: block.data?.fileKey || null,
            size: block.data?.size || null,
            naturalHeight: block.data?.naturalHeight || null,
            naturalWidth: block.data?.naturalWidth || null,
        },
    }), [block]);

    const getInitialFormatting = useCallback(() => ({
        ...DEFAULT_FORMATTING,
        ...block.formatting,
    }), [block.formatting]);

    const [dataFile, setDataFile] = useState(getInitialDataFile);
    const [formatting, setFormatting] = useState(getInitialFormatting);
    const [errors, setErrors] = useState({ content: false, alt: false, fileName: false });

    useDeepCompareEffect(() => {
        onChange();
    }, [dataFile, formatting]);

    const updateFormatting = useCallback((changesObj) => {
        const newFormatting = { ...formatting, ...changesObj };
        setFormatting(newFormatting);
    }, [formatting]);

    const handleInputChange = useCallback((key, value, min = 0, max = 100) => {
        let numValue = parseInt(value, 10) || min;
        numValue = Math.max(min, Math.min(max, numValue));
        updateFormatting({ [key]: numValue });
    }, [updateFormatting]);

    const handleImageLoad = useCallback((e) => {
        const { naturalWidth, naturalHeight } = e.target;
        setDataFile(prevDataFile => ({
            ...prevDataFile,
            data: {
                ...prevDataFile.data,
                naturalWidth,
                naturalHeight,
            },
        }));
    }, []);

    const handleFileClick = useCallback(() => {

        fileInputRef.current.click();
    }, []);

    const handleFileChange = useCallback(async (e) => {
        setErrors(prevState => ({ ...prevState, content: false }));
        const file = e.target.files[0];

        const fileKey = `image-${Date.now()}-${file.name}`;

        await saveToIndexedDB(fileKey, file);

        dispatch(addImage({
            blockId: block.id, // gdfgdfgdf54-51f5d1g5d15fgd-51fg5d1f5g1d5g
            key: fileKey, // image-175115484-origNameSKompa
            file, // файл бин
            fileName: file.name // origNameSKompa.png
        }));

        setDataFile(prev => ({
            ...prev,
            content: URL.createObjectURL(file),
            data: {
                ...prev.data,
                fileKey: fileKey, // image-175115484-origNameSKompa
                fileName: file.name.split('.')[0], // origNameSKompa
                fileType: file.type, // image/png
                fileSize: Math.round(file.size / 1024) + 'KB', // 11KB
                size: file.size, // 12345 байт
            }
        }));
    }, [dispatch, block.id]);

    const handleAltToggle = useCallback(() => {
        updateFormatting({ showAlt: !formatting.showAlt });
    }, [formatting.showAlt, updateFormatting]);

    const handleAltChange = useCallback((e) => {
        const altValue = e.target.value;
        setErrors(prev => ({...prev, alt: false}));
        setDataFile(prevDataFile => ({
            ...prevDataFile,
            data: {
                ...prevDataFile.data,
                alt: altValue,
            }
        }));
    }, []);

    const handleFileNameChange = useCallback((e) => {
        setErrors(prev => ({...prev, fileName: false}));
        setDataFile(prevDataFile => ({
            ...prevDataFile,
            data: {
                ...prevDataFile.data,
                fileName: e.target.value,
            },
        }));
    }, []);

    const handleAlignToggle = useCallback((value) => () => {
        updateFormatting({ alignment: value })
    }, [updateFormatting]);

    const handleBorderToggle = useCallback(() => {
        if (formatting.useBorder) {
            updateFormatting({ useBorder: false });
        } else {
            updateFormatting({
                useBorder: true,
                borderWidth: DEFAULT_FORMATTING.borderWidth,
                borderStyle: DEFAULT_FORMATTING.borderStyle,
                borderColor: DEFAULT_FORMATTING.borderColor
            });
        }
    }, [formatting.useBorder, updateFormatting]);

    const handleBorderStyleChange = useCallback((e) => {
        updateFormatting({ borderStyle: e.target.value });
    }, [updateFormatting]);

    const handleBorderWidthChange = useCallback((e) => {
        handleInputChange('borderWidth', e.target.value, 1, 10);
    }, [handleInputChange]);

    const handleBorderColorChange = useCallback((e) => {
        updateFormatting({ borderColor: e.target.value });
    }, [updateFormatting]);

    const handleBorderRadiusToggle = useCallback(() => {
        if (formatting.useBorderRadius) {
            updateFormatting({ useBorderRadius: false });
        } else {
            updateFormatting({
                useBorderRadius: true,
                borderRadius: DEFAULT_FORMATTING.borderRadius
            });
        }
    }, [formatting.useBorderRadius, updateFormatting]);

    const handleBorderRadiusChange = useCallback((e) => {
        handleInputChange('borderRadius', e.target.value, 1, 50);
    }, [handleInputChange]);

    const handleSizeToggle = useCallback(() => {
        updateFormatting({
            useResize: !formatting.useResize,
            size: formatting.useResize ? undefined : DEFAULT_FORMATTING.size
        });
    }, [formatting.useResize, updateFormatting]);

    const handleSizeChange = useCallback((e) => {
        handleInputChange('size', e.target.value, 10, 100);
    }, [handleInputChange]);

    const handleMarginTopToggle = useCallback(() => {
        updateFormatting({
            useMarginTop: !formatting.useMarginTop,
            marginTop: formatting.useMarginTop ? undefined : DEFAULT_FORMATTING.marginTop
        });
    }, [formatting.useMarginTop, updateFormatting]);

    const handleMarginTopChange  = useCallback((e) => {
        handleInputChange('marginTop', e.target.value, 1, 50);
    }, [handleInputChange]);

    const handleMarginBottomToggle = useCallback(() => {
        updateFormatting({
            useMarginBottom: !formatting.useMarginBottom,
            marginBottom: formatting.useMarginBottom ? undefined : DEFAULT_FORMATTING.marginBottom
        });
    }, [formatting.useMarginBottom, updateFormatting]);

    const handleMarginBottomChange = useCallback((e) => {
        handleInputChange('marginBottom', e.target.value, 1, 50);
    }, [handleInputChange]);

    const previewStyle = useMemo(() => ({
        marginTop: formatting.useMarginTop
            ? `${formatting.marginTop ?? DEFAULT_FORMATTING.marginTop}px`
            : undefined,
        marginBottom: formatting.useMarginBottom
            ? `${formatting.marginBottom ?? DEFAULT_FORMATTING.marginBottom}px`
            : undefined,
        alignItems: formatting.alignment === 'left'
            ? 'flex-start'
            : formatting.alignment === 'right'
                ? 'flex-end'
                : 'center',
        maxWidth: formatting.useResize
            ? `${formatting.size ?? DEFAULT_FORMATTING.size}%`
            : `${DEFAULT_FORMATTING.size}%`,
        borderStyle: () => {
            if (!formatting.useBorder) return 'none';
            return `${formatting.borderWidth ?? DEFAULT_FORMATTING.borderWidth}px ${formatting.borderStyle ?? DEFAULT_FORMATTING.borderStyle} ${formatting.borderColor ?? DEFAULT_FORMATTING.borderColor}`;
        },
        borderRadius: formatting.useBorderRadius
            ? `${formatting.borderRadius ?? DEFAULT_FORMATTING.borderRadius}px`
            : '0'
    }), [formatting]);

    useImperativeHandle(ref, () => ({
        validate() {
            const newErrors = {
                alt: !dataFile.data.alt || !dataFile.data.alt.trim(),
                fileName: !dataFile.data?.fileName || !/^[a-zA-Z0-9_-]+$/.test(dataFile.data.fileName.trim()),
                content: !dataFile.content
            };
            setErrors(newErrors);

            if (newErrors.alt) {
                altRef.current?.focus();
                return false;
            }
            if (newErrors.fileName) {
                fileNameRef.current?.focus();
                return false;
            }
            if (newErrors.content) {
                fileInputRef.current?.focus();
                return false;
            }

            return true;
        },
        getContent: () => ({
            ...dataFile,
            formatting: {...formatting}
        })
    }));

    return (
        <div className="imageblock">
            {/*Блок контента*/}
            <div className="imageblock__fields">
                {/*Кнопка загрузки*/}
                <button
                    type="button"
                    className="imageblock__upload-btn"
                    onClick={handleFileClick}
                    title="Загрузка изображения"
                >
                    {dataFile.content ? 'Заменить изображение' : 'Загрузить изображение'}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept={acceptString}
                    onChange={handleFileChange}
                    className="imageblock__file-input"
                />
                {errors.content && (
                    <div className="imageblock__error">
                        Поддерживаются только JPG, PNG, WebP изображения и файлы не более 5МВ.
                    </div>
                )}
                {/*Alt и имя файла*/}
                {dataFile.content && (
                    <>
                        <div className="imageblock__field">
                            <label className="imageblock__label">Описание изображения (alt)*</label>
                            <input
                                ref={altRef}
                                type="text"
                                value={dataFile.data.alt ?? ''}
                                onChange={handleAltChange}
                                placeholder="Введите описание изображения"
                                className={`imageblock__input ${errors.alt ? 'imageblock__input--error' : ''}`}
                            />
                            {errors.alt &&
                                <div className="imageblock__error">
                                    Обязательное поле.
                                </div>
                            }
                        </div>
                        <div className="imageblock__field">
                            <label className="imageblock__label">Имя файла (без расширения)*</label>
                            <input
                                ref={fileNameRef}
                                type="text"
                                value={dataFile.data.fileName ?? ''}
                                onChange={handleFileNameChange}
                                placeholder="Введите имя файла"
                                className={`imageblock__input ${errors.fileName ? 'imageblock__input--error' : ''}`}
                            />
                            {errors.fileName && (
                                <div className="imageblock__error">
                                    Допустимы только латинские буквы, цифры, дефисы и подчёркивания.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            {/*Блок форматирования*/}
            {showSettings && (
                <div className="imageblock__toolbar">
                    {/*Отображение описания*/}
                    <div className="imageblock__toolbar-section">
                        <button
                            type="button"
                            onClick={handleAltToggle}
                            className={`imageblock__format-btn ${formatting.showAlt ? 'imageblock__format-btn--active' : ''}`}
                            title={formatting.showAlt ? "Скрыть описание" : "Отображать описание"}
                        >
                            {formatting.showAlt ? <MdOutlineSubtitles /> : <MdOutlineSubtitlesOff />}
                        </button>
                    </div>
                    {/*Кнопки выравнивания*/}
                    <div className="imageblock__toolbar-section">
                        <div className="imageblock__alignment-btns">
                            {alignOptions.map(option => (
                                <button
                                    type="button"
                                    key={option.value}
                                    onClick={handleAlignToggle(option.value)}
                                    className={`imageblock__format-btn ${formatting.alignment === option.value ? 'imageblock__format-btn--active' : ''}`}
                                    title={option.title}
                                >
                                    {option.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/*Рамка*/}
                    <div className="imageblock__toolbar-section">
                        <button
                            type="button"
                            onClick={handleBorderToggle}
                            className={`imageblock__format-btn ${formatting.useBorder ? 'imageblock__format-btn--active' : ''}`}
                            title={formatting.useBorder ? "Добавить рамку" : "Убрать рамку"}
                        >
                            <RxBorderAll />
                        </button>
                        {/*Настройки рамки*/}
                        {formatting.useBorder && (
                            <>
                                {/*Стиль линии*/}
                                <div className="imageblock__border-style-container">
                                    <RxBorderStyle className="imageblock__icon" />
                                    <select
                                        value={formatting.borderStyle}
                                        onChange={handleBorderStyleChange}
                                        className="imageblock__select"
                                        title="Стиль линии рамки"
                                    >
                                        {borderStyleOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {/*Толщина линии*/}
                                <div className="imageblock__input-group">
                                    <BsBorderWidth className="imageblock__icon" />
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formatting.borderWidth}
                                        onChange={handleBorderWidthChange}
                                        className="imageblock__number-input"
                                        title="Толщина рамки (1-10px)"
                                    />
                                </div>
                                <div className="imageblock__color-container">
                                    <input
                                        type="color"
                                        value={formatting.borderColor}
                                        onChange={handleBorderColorChange}
                                        className="imageblock__color-input"
                                        title="Цвет рамки"
                                    />
                                    <div
                                        className="imageblock__color-preview"
                                        style={{ backgroundColor: formatting.borderColor }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    {/*Скругление*/}
                    <div className="imageblock__toolbar-section">
                        <button
                            type="button"
                            onClick={handleBorderRadiusToggle}
                            className={`imageblock__format-btn ${formatting.useBorderRadius ? 'imageblock__format-btn--active' : ''}`}
                            title={formatting.useBorderRadius ? 'Убрать скругление углов' : 'Добавить скругление углов'}
                        >
                            <BiBorderRadius />
                        </button>

                        {formatting.useBorderRadius && (
                            <div className="imageblock__input-group">
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formatting.borderRadius}
                                    onChange={handleBorderRadiusChange}
                                    className="imageblock__number-input"
                                    title="Скругление углов (1-50px)"
                                />
                            </div>
                        )}
                    </div>
                    {/*Размер изображения*/}
                    <div className="imageblock__toolbar-section">
                        <button
                            type="button"
                            onClick={handleSizeToggle}
                            className={`imageblock__format-btn ${formatting.useResize ? 'imageblock__format-btn--active' : ''}`}
                            title="Изменить размер изображения"
                        >
                            <GiResize />
                        </button>

                        {formatting.useResize && (
                            <div className="imageblock__input-group">
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={formatting.size}
                                    onChange={handleSizeChange}
                                    className="imageblock__range"
                                    title="Размер изображения (10-100%)"
                                />
                            </div>
                        )}
                    </div>
                    {/*Отступ сверху*/}
                    <div className="imageblock__toolbar-section">
                        <button
                            type="button"
                            onClick={handleMarginTopToggle}
                            className={`imageblock__format-btn ${formatting.useMarginTop ? 'imageblock__format-btn--active' : ''}`}
                            title={formatting.useMarginTop ? 'Убрать отступ сверху' : 'Добавить отступ сверху'}
                        >
                            <MdVerticalAlignTop />
                        </button>

                        {formatting.useMarginTop && (
                            <div className="imageblock__input-group">
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formatting.marginTop}
                                    onChange={handleMarginTopChange}
                                    className="imageblock__number-input"
                                    title="Отступ сверху (0-50px)"
                                />
                            </div>
                        )}
                    </div>
                    {/*Отступ снизу*/}
                    <div className="imageblock__toolbar-section">
                        <button
                            type="button"
                            onClick={handleMarginBottomToggle}
                            className={`imageblock__format-btn ${formatting.useMarginBottom ? 'imageblock__format-btn--active' : ''}`}
                            title={formatting.useMarginBottom ? 'Убрать отступ снизу' : 'Добавить отступ снизу'}
                        >
                            <MdVerticalAlignBottom />
                        </button>

                        {formatting.useMarginBottom && (
                            <div className="imageblock__input-group">
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formatting.marginBottom}
                                    onChange={handleMarginBottomChange}
                                    className="imageblock__number-input"
                                    title="Отступ снизу (0-50px)"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/*Разделитель*/}
            {dataFile.content && <hr />}
            {/*Просмотр*/}
            {dataFile.content && (
                <div className="imageblock__preview" style={{
                    paddingTop: previewStyle.marginTop,
                    paddingBottom: previewStyle.marginBottom,
                }}>
                    <div className="imageblock__preview-container" style={{
                        alignItems: previewStyle.alignItems
                    }}>
                        <div className="imageblock__img-box" style={{
                            maxWidth: previewStyle.maxWidth
                        }}>
                            <img
                                src={getImageSrc(dataFile.content)}
                                alt={dataFile.data.alt}
                                onLoad={handleImageLoad}
                                className="imageblock__image"
                                style={{
                                    borderRadius: previewStyle.borderRadius,
                                    border: previewStyle.borderStyle()
                                }}
                            />
                            {formatting.showAlt && dataFile.data.alt && (
                                <div className="imageblock__alt-text">
                                    {dataFile.data.alt}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default memo(ImageBlock);