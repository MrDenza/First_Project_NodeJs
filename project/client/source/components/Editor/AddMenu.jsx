import React, { useState, useRef, useEffect, memo } from "react";
import { FaPlus, FaRegImage } from "react-icons/fa";
import { FaT } from "react-icons/fa6";
import { LuHeading } from "react-icons/lu";
import './AddMenu.css';

const AddMenu = ({ index, onAdd }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggle = (e) => {
        e.stopPropagation();
        setOpen(prev => !prev);
    };

    const handleAdd = (type) => {
        onAdd(index, type);
        setOpen(false);
    };

    return (
        <div ref={menuRef} className="addmenu">
            <div className="addmenu__container">
                <button
                    onClick={toggle}
                    className="addmenu__toggle"
                    title="Добавить блок"
                    type="button"
                >
                    <FaPlus size="20"/>
                </button>
                <div className="addmenu__divider" />
            </div>

            {open && (
                <div className="addmenu__menu">
                    <button
                        onClick={() => handleAdd('text')}
                        className="addmenu__button"
                        title="Текст"
                        type="button"
                    >
                        <FaT className="addmenu__icon" />
                    </button>
                    <button
                        onClick={() => handleAdd('heading')}
                        className="addmenu__button"
                        title="Заголовок"
                        type="button"
                    >
                        <LuHeading className="addmenu__icon" size="20" />
                    </button>
                    <button
                        onClick={() => handleAdd('image')}
                        className="addmenu__button"
                        title="Изображение"
                        type="button"
                    >
                        <FaRegImage className="addmenu__icon" size="20" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default memo(AddMenu);