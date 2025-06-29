import React, { forwardRef, memo } from "react";
import { Link } from "react-router-dom";
import "./PostCard.css";

const PostCard = forwardRef(({ post }, ref) => {
    return (
        <div className="post-card" ref={ref}>
            <div className="post-card__content">
                <h2 className="post-card__title">
                    <Link to={`/posts/view/${post.id}`}>{post.title}</Link>
                </h2>

                <div className="post-card__meta">
                    <span className="post-card__author">
                        Автор: {post.author?.username || "Неизвестный автор"}
                    </span>
                    <span className="post-card__date">
                        {new Date(post.createdAt).toLocaleDateString("ru-RU", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>

                <div className="post-card__excerpt">
                    {post.excerpt}
                    <div className="post-card__fade"></div>
                </div>

                <div className="post-card__actions">
                    <Link to={`/posts/view/${post.id}`} className="post-card__read-more">
                        Читать полностью
                    </Link>
                </div>
            </div>
        </div>
    );
});

export default memo(PostCard);