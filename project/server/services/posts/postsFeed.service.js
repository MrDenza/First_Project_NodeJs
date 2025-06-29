const db = require('../../database/database');

module.exports = {
    async getFeedPosts(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        // Получаем общее количество опубликованных постов
        const total = await db.repositories.Post.getPostsCount();

        // Получаем посты с пагинацией и связанными данными
        const posts = await db.repositories.Post.getPostsByStatus(offset, limit);

        const formattedPosts = posts.map(post => ({
            id: post.id,
            title: post.title,
            description: post.description,
            status: post.status,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            author: {
                id: post.author?.id,
                username: post.author?.username
            },
            excerpt: this.generateExcerpt(post.description, post.content)
        }));

        return {
            posts: formattedPosts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    },

    // Генерация краткого описания для превью
    generateExcerpt(description, content = []) {
        if (description) {
            return description.length > 150
                ? description.substring(0, 150) + '...'
                : description;
        }

        const textBlocks = content.filter(
            block => block.type === 'text' || block.type === 'heading'
        );

        let excerpt = '';
        for (const block of textBlocks) {
            if (excerpt.length > 150) break;
            excerpt += ' ' + block.content;
        }

        return excerpt.length > 150
            ? excerpt.substring(0, 150) + '...'
            : excerpt || 'Нет описания';
    }
};