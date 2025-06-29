import React, { memo } from "react";
import "./PostView.css";
import { getImageSrc } from "../../utils/imageSrc";
import { Helmet } from "react-helmet-async";

const fontSizeMap = {
    2: '2rem',
    3: '1.75rem',
    4: '1.5rem',
    5: '1.25rem',
    6: '1rem'
};

const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const PostView = ({ meta = {}, content = [] }) => {

    return (
        <div className="post-view">
            {/* Мета-информация */}
            <Helmet>
                <meta name="description" content={meta.description || ""} />
                <meta name="keywords" content={meta.keywords || ""} />
            </Helmet>

            {/* Информация */}
            <div className="post-meta">
                <h1 className="post-title">{meta.title}</h1>

                <div className="post-author-date">
                    <span className="post-author">{meta.author}</span>
                    <span className="post-date">{formatDate(meta.date)}</span>
                </div>

                {meta.description && (
                    <p className="post-description">{meta.description}</p>
                )}

                {meta.keywords && (
                    <div className="post-keywords">
                        {meta.keywords.split(',').map((keyword, index) => (
                            <span key={index} className="keyword-tag">
                                {keyword.trim()}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Контент поста */}
            <div className="post-content">
                {content?.map(block => {
                    // Текстовый блок
                    if (block.type === 'text') {
                        const style = {
                            fontWeight: block.formatting?.bold ? 'bold' : 'normal',
                            fontStyle: block.formatting?.italic ? 'italic' : 'normal',
                            textDecoration: block.formatting?.underline
                                ? (block.formatting?.strikethrough ? 'underline line-through' : 'underline')
                                : (block.formatting?.strikethrough ? 'line-through' : 'none'),
                            color: block.formatting?.color || '#000000',
                            textAlign: block.formatting?.alignment || 'left',
                            fontSize: `${block.formatting?.fontSize || 16}px`,
                            marginTop: block.formatting?.useMarginTop ? `${block.formatting?.marginTop || 0}px` : 0,
                            marginBottom: block.formatting?.useMarginBottom ? `${block.formatting?.marginBottom || 0}px` : 0,
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        };

                        return (
                            <p key={block.id} style={style} className="text-block">
                                {block.content}
                            </p>
                        );
                    }

                    // Заголовок
                    if (block.type === 'heading') {
                        const HeadingTag = `h${block.formatting?.level || 2}`;
                        const style = {
                            textAlign: block.formatting?.alignment || 'left',
                            color: block.formatting?.color || '#000000',
                            fontWeight: block.formatting?.bold ? 'bold' : 'normal',
                            fontStyle: block.formatting?.italic ? 'italic' : 'normal',
                            textDecoration: block.formatting?.underline
                                ? (block.formatting?.strikethrough ? 'underline line-through' : 'underline')
                                : (block.formatting?.strikethrough ? 'line-through' : 'none'),
                            marginTop: block.formatting?.useMarginTop ? `${block.formatting?.marginTop || 0}px` : 0,
                            marginBottom: block.formatting?.useMarginBottom ? `${block.formatting?.marginBottom || 15}px` : 0,
                            lineHeight: '1.3'
                        };

                        style.fontSize = fontSizeMap[block.formatting?.level || 2] || '2rem';

                        return (
                            <HeadingTag key={block.id} style={style} className="heading-block">
                                {block.content}
                            </HeadingTag>
                        );
                    }

                    // Изображение
                    if (block.type === 'image') {
                        const imageStyle = {
                            borderRadius: block.formatting?.useBorderRadius ? `${block.formatting?.borderRadius || 0}px` : 0,
                            border: block.formatting?.useBorder
                                ? `${block.formatting?.borderWidth || 1}px ${block.formatting?.borderStyle || 'solid'} ${block.formatting?.borderColor || '#cccccc'}`
                                : 'none'
                        };

                        return (
                            <div
                                key={block.id}
                                className="image-block"
                                style={{
                                    display: 'flex',
                                    justifyContent: block.formatting?.alignment === 'left' ? 'flex-start' :
                                        block.formatting?.alignment === 'right' ? 'flex-end' : 'center',
                                    marginTop: block.formatting?.useMarginTop ? `${block.formatting?.marginTop || 0}px` : 0,
                                    marginBottom: block.formatting?.useMarginBottom ? `${block.formatting?.marginBottom || 0}px` : 0
                                }}
                            >
                                <div className="image-container" style={{
                                    maxWidth: block.formatting?.useResize ? `${block.formatting?.size || 100}%` : '100%',
                                    width: block.formatting?.useResize ? `${block.formatting?.size || 100}%` : '100%',
                                }}>
                                    <img
                                        src={getImageSrc(block.content)}
                                        alt={block.data?.alt || ''}
                                        style={imageStyle}
                                        className="post-image"
                                    />

                                    {block.formatting?.showAlt && block.data?.alt && (
                                        <div className="image-caption">
                                            {block.data.alt}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // Разделитель
                    if (block.type === 'divider') {
                        return (
                            <div key={block.id} className="divider-block">
                                <hr />
                            </div>
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
};

export default memo(PostView);