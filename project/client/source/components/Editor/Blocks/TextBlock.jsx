import React, { useImperativeHandle, forwardRef, useRef, useState, useEffect, useCallback, memo } from "react";
import {
    FaAlignCenter,
    FaAlignLeft,
    FaAlignRight,
    FaAlignJustify,
    FaBold,
    FaItalic,
    FaUnderline,
    FaStrikethrough
} from "react-icons/fa";
import { MdVerticalAlignTop, MdVerticalAlignBottom } from "react-icons/md";
import './TextBlock.css';
import useDeepCompareEffect from "../../../hooks/useDeepCompareEffect";

const DEFAULT_FORMATTING = {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    color: '#000000',
    alignment: 'left',
    fontSize: 14,
    useMarginTop: false,
    marginTop: 0,
    useMarginBottom: false,
    marginBottom: 0,
}

const formatButtons = [
    {
        format: 'bold',
        icon: <FaBold />,
        title: 'Жирный',
        disabledBtn: false,
    },
    {
        format: 'italic',
        icon: <FaItalic />,
        title: 'Курсив',
        disabledBtn: false,
    },
    {
        format: 'underline',
        icon: <FaUnderline />,
        title: 'Подчёркнутый',
        disabledBtn: false,
    },
    {
        format: 'strikethrough',
        icon: <FaStrikethrough />,
        title: 'Зачёркнутый',
        disabledBtn: false,
    }
];

const alignmentButtons = [
    {
        value: 'left',
        icon: <FaAlignLeft />,
        title: 'По левому краю',
        disabledBtn: false,
    },
    {
        value: 'center',
        icon: <FaAlignCenter />,
        title: 'По центру',
        disabledBtn: false,
    },
    {
        value: 'right',
        icon: <FaAlignRight />,
        title: 'По правому краю',
        disabledBtn: false,
    },
    {
        value: 'justify',
        icon: <FaAlignJustify />,
        title: 'Растянуть',
        disabledBtn: false,
    }
];

const fontSizeOptions = [
    { value: 10, label: '10px' },
    { value: 12, label: '12px' },
    { value: 14, label: '14px' },
    { value: 16, label: '16px' },
    { value: 18, label: '18px' },
    { value: 20, label: '20px' },
    { value: 24, label: '24px' }
];

const TextBlock = forwardRef(({ block, onChange, showSettings }, ref) => {
    const textareaRef = useRef();
    const [text, setText] = useState(block.content || '');
    const [formatting, setFormatting] = useState({
        ...DEFAULT_FORMATTING,
        ...block.formatting
    });
    const [error, setError] = useState(false);

    useDeepCompareEffect(() => {
        onChange();
    }, [text, formatting]);

    useEffect(() => {
        const adjustHeight = () => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            }
        };

        adjustHeight();
        window.addEventListener('resize', adjustHeight);

        return () => {
            window.removeEventListener('resize', adjustHeight);
        };
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    const updateFormatting = useCallback((changesObj) => {
        const newFormatting = { ...formatting, ...changesObj };
        setFormatting(newFormatting);
    }, [formatting]);

    const isFormatActive = useCallback((button) => {
        if (button.format) {
            return formatting[button.format];
        }
        return formatting.alignment === button.value;
    }, [formatting]);

    const handleInputChange = useCallback((key, value, min = 0, max = 100) => {
        let numValue = parseInt(value, 10) || min;
        numValue = Math.max(min, Math.min(max, numValue));
        updateFormatting({ [key]: numValue });
    }, [updateFormatting]);

    const handleFontSizeChange = useCallback((e) => {
        updateFormatting({ fontSize: Number(e.target.value) })
    }, [updateFormatting]);

    const handleFormatButtonClick = useCallback((button) => (e) => {
        e.preventDefault();
        if (button.format) {
            updateFormatting({ [button.format]: !formatting[button.format] });
        } else if (button.value) {
            updateFormatting({ alignment: button.value });
        }
    }, [updateFormatting, formatting]);

    const renderFormatButton = useCallback((button) => (
        <button
            type="button"
            key={button.format || button.value}
            disabled={button.disabledBtn}
            onClick={handleFormatButtonClick(button)}
            className={`textblock__format-btn ${isFormatActive(button) ? 'textblock__format-btn--active' : ''}`}
            title={`${button.title} ${button.disabledBtn ? `- недоступно` : ``}`}
        >
            {button.icon}
        </button>
    ), [handleFormatButtonClick, isFormatActive, formatting]);

    const handleFontColorChange = useCallback((e) => {
        updateFormatting({ color: e.target.value })
    }, [updateFormatting]);

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

    const handleTextChange = useCallback((e) => {
        const newText = e.target.value;
        setText(newText);
        setError(false);
    }, []);

    const getTextareaStyle = () => {
        return {
            textAlign: formatting.alignment,
            fontWeight: formatting.bold ? 'bold' : 'normal',
            fontStyle: formatting.italic ? 'italic' : 'normal',
            textDecoration: formatting.underline
                ? (formatting.strikethrough ? 'underline line-through' : 'underline')
                : (formatting.strikethrough ? 'line-through' : 'none'),
            color: formatting.color,
            fontSize: `${formatting.fontSize}px`,
            marginTop: formatting.useMarginTop ? `${formatting.marginTop}px` : '0',
            marginBottom: formatting.useMarginBottom ? `${formatting.marginBottom}px` : '0',
        };
    };

    useImperativeHandle(ref, () => ({
        validate() {
            if (!text.trim()) {
                setError('Текст не может быть пустым');
                textareaRef.current?.focus();
                return false;
            }
            setError(null);
            return true;
        },
        getContent: () => ({
            content: text,
            formatting: {...formatting}
        })
    }));

    return (
        <div className="textblock">
            {/* Блок форматирования */}
            {showSettings && (
                <div className="textblock__toolbar">
                    {/* Размер шрифта */}
                    <div className="textblock__toolbar-section">
                        <div className="textblock__format-group">
                            <select
                                value={formatting.fontSize}
                                onChange={handleFontSizeChange}
                                className="textblock__select"
                                title="Размер шрифта"
                            >
                                {fontSizeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Стиль шрифта */}
                    <div className="textblock__toolbar-section">
                        {formatButtons.map(renderFormatButton)}
                    </div>
                    {/* Расположение текса */}
                    <div className="textblock__toolbar-section">
                        {alignmentButtons.map(renderFormatButton)}
                    </div>
                    {/*Цвет текста*/}
                    <div className="textblock__toolbar-section">
                        <div className="textblock__color-container">
                            <input
                                type="color"
                                value={formatting.color}
                                onChange={handleFontColorChange}
                                className="textblock__color-input"
                                title="Цвет текста"
                            />
                            <div
                                className="textblock__color-preview"
                                style={{ backgroundColor: formatting.color }}
                            />
                        </div>
                    </div>
                    {/*Отступ сверху*/}
                    <div className="textblock__toolbar-section">
                        <button
                            type="button"
                            onClick={handleMarginTopToggle}
                            className={`textblock__format-btn ${formatting.useMarginTop ? 'textblock__format-btn--active' : ''}`}
                            title={formatting.useMarginTop ? 'Убрать отступ сверху' : 'Добавить отступ сверху'}
                        >
                            <MdVerticalAlignTop />
                        </button>

                        {formatting.useMarginTop && (
                            <div className="textblock__input-group">
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formatting.marginTop}
                                    onChange={handleMarginTopChange}
                                    className="textblock__number-input"
                                    title="Отступ сверху (1-50px)"
                                />
                            </div>
                        )}
                    </div>
                    {/*Отступ снизу*/}
                    <div className="textblock__toolbar-section">
                        <button
                            type="button"
                            onClick={handleMarginBottomToggle}
                            className={`textblock__format-btn ${formatting.useMarginBottom ? 'textblock__format-btn--active' : ''}`}
                            title={formatting.useMarginBottom ? 'Убрать отступ снизу' : 'Добавить отступ снизу'}
                        >
                            <MdVerticalAlignBottom />
                        </button>

                        {formatting.useMarginBottom && (
                            <div className="textblock__input-group">
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formatting.marginBottom}
                                    onChange={handleMarginBottomChange}
                                    className="textblock__number-input"
                                    title="Отступ снизу (0-50px)"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/*Разделитель*/}
            {showSettings && (<hr />)}
            {/*Просмотр*/}
            <div className="textblock__editor">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    className={`textblock__textarea ${error ? 'textblock__textarea--error' : ''}`}
                    style={getTextareaStyle()}
                    placeholder="Введите текст..."
                    rows="1"
                />
                {error && <div className="textblock__error">{error}</div>}
            </div>
        </div>
    );
});

export default memo(TextBlock);