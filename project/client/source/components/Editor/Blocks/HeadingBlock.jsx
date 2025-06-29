import React, { useImperativeHandle, forwardRef, useRef, useState, useEffect, useCallback, memo } from "react";
import {
    FaAlignCenter,
    FaAlignLeft,
    FaAlignRight,
    FaBold,
    FaItalic,
    FaUnderline,
    FaStrikethrough, FaAlignJustify,
} from "react-icons/fa";
import { MdVerticalAlignTop, MdVerticalAlignBottom } from "react-icons/md";
import './HeadingBlock.css';
import useDeepCompareEffect from "../../../hooks/useDeepCompareEffect";

const DEFAULT_FORMATTING = {
    bold: true,
    italic: false,
    underline: false,
    strikethrough: false,
    color: '#000000',
    alignment: 'left',
    level: 2,
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
        disabledBtn: true,
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

const levelOptions = [
    { value: 2, label: 'H2' },
    { value: 3, label: 'H3' },
    { value: 4, label: 'H4' },
    { value: 5, label: 'H5' },
    { value: 6, label: 'H6' }
];

const fontSizeMap = {
    2: '1.8em',
    3: '1.5em',
    4: '1.25em',
    5: '1.1em',
    6: '1em'
};

const HeadingBlock = forwardRef(({ block, onChange, showSettings }, ref) => {
    const textareaRef = useRef();
    const [text, setText] = useState(block.content || '');
    const [formatting, setFormatting] = useState({
        ...DEFAULT_FORMATTING,
        ...block.formatting
    });
    const [error, setError] = useState(null);

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

    const isFormatActive = (button) => {
        if (button.format) {
            return formatting[button.format];
        }
        return formatting.alignment === button.value;
    };

    const handleInputChange = useCallback((key, value, min = 0, max = 100) => {
        let numValue = parseInt(value, 10) || min;
        numValue = Math.max(min, Math.min(max, numValue));
        updateFormatting({ [key]: numValue });
    }, [updateFormatting]);

    const handleLevelChange = useCallback((e) => {
        updateFormatting({ level: Number(e.target.value) })
    }, [updateFormatting]);

    const handleFormatButtonClick = useCallback((button) => (e) => {
        e.preventDefault();
        if (button.format) {
            updateFormatting({ [button.format]: !formatting[button.format] });
        } else if (button.value) {
            updateFormatting({ alignment: button.value });
        }
    }, [updateFormatting, formatting]);

    const renderFormatButton = (button) => (
        <button
            type="button"
            key={button.format || button.value}
            disabled={button.disabledBtn}
            onClick={handleFormatButtonClick(button)}
            className={`headingblock__format-btn ${isFormatActive(button) ? 'headingblock__format-btn--active' : ''}`}
            title={`${button.title} ${button.disabledBtn ? `- недоступно` : ``}`}
        >
            {button.icon}
        </button>
    );

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
            fontSize: fontSizeMap[formatting.level] || '1.8em',
            marginTop: formatting.useMarginTop ? `${formatting.marginTop}px` : '0',
            marginBottom: formatting.useMarginBottom ? `${formatting.marginBottom}px` : '0',
        };
    };

    useImperativeHandle(ref, () => ({
        validate() {
            if (!text.trim()) {
                setError('Заголовок не может быть пустым');
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
        <div className="headingblock">
            {/*Блок настроек*/}
            {showSettings && (
                <div className="headingblock__toolbar">
                    {/*Уровень заголовка*/}
                    <div className="headingblock__toolbar-section">
                        <select
                            value={formatting.level}
                            onChange={handleLevelChange}
                            className="headingblock__select"
                            title="Уровень заголовка"
                        >
                            {levelOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Стиль шрифта */}
                    <div className="headingblock__toolbar-section">
                        {formatButtons.map(renderFormatButton)}
                    </div>
                    {/* Расположение текса */}
                    <div className="headingblock__toolbar-section">
                        {alignmentButtons.map(renderFormatButton)}
                    </div>
                    {/*Цвет текста*/}
                    <div className="headingblock__toolbar-section">
                        <div className="headingblock__color-container">
                            <input
                                type="color"
                                value={formatting.color}
                                onChange={handleFontColorChange}
                                className="headingblock__color-input"
                                title="Цвет текста"
                            />
                            <div
                                className="headingblock__color-preview"
                                style={{ backgroundColor: formatting.color }}
                            />
                        </div>
                    </div>
                    {/*Отступ сверху*/}
                    <div className="headingblock__toolbar-section">
                        <button
                            type="button"
                            onClick={handleMarginTopToggle}
                            className={`headingblock__format-btn ${formatting.useMarginTop ? 'headingblock__format-btn--active' : ''}`}
                            title={formatting.useMarginTop ? 'Убрать отступ сверху' : 'Добавить отступ сверху'}
                        >
                            <MdVerticalAlignTop />
                        </button>

                        {formatting.useMarginTop && (
                            <div className="headingblock__input-group">
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formatting.marginTop}
                                    onChange={handleMarginTopChange}
                                    className="headingblock__number-input"
                                    title="Отступ сверху (1-50px)"
                                />
                            </div>
                        )}
                    </div>
                    {/*Отступ снизу*/}
                    <div className="headingblock__toolbar-section">
                        <button
                            type="button"
                            onClick={handleMarginBottomToggle}
                            className={`headingblock__format-btn ${formatting.useMarginBottom ? 'headingblock__format-btn--active' : ''}`}
                            title={formatting.useMarginBottom ? 'Убрать отступ снизу' : 'Добавить отступ снизу'}
                        >
                            <MdVerticalAlignBottom />
                        </button>

                        {formatting.useMarginBottom && (
                            <div className="headingblock__input-group">
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formatting.marginBottom}
                                    onChange={handleMarginBottomChange}
                                    className="headingblock__number-input"
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
            <div className="headingblock__editor">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    className={`headingblock__textarea ${error ? 'headingblock__textarea--error' : ''}`}
                    style={getTextareaStyle()}
                    placeholder="Введите заголовок..."
                    rows="1"
                />
                {error && <div className="headingblock__error">{error}</div>}
            </div>
        </div>
    );
});

export default memo(HeadingBlock);