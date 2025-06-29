const db = require('../../database/database');

module.exports = {
    async getPostById(postId) {
        const post = await db.repositories.Post.getPostById(
            postId,
            true,   // includeBlocks
            true,   // includeImages
            true    // includeAuthor
        );

        if (!post) {
            return false;
        }

        // Форматирование размера файла
        function formatFileSize(bytes) {
            if (bytes < 1024) return `${bytes} B`;
            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
            return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
        }

        // Сортируем блоки по полю order перед формированием контента
        const sortedBlocks = post.blocks.sort((a, b) => a.order - b.order);

        const meta = {
            id: post.id,
            title: post.title,
            author: post.author?.username || "Неизвестный автор",
            date: post.updated_at,
            description: post.description,
            keywords: post.keywords
        };

        const content = sortedBlocks.map(block => {
            let formattingData = block.formatting;

            try {
                formattingData = block.formatting ? JSON.parse(block.formatting) : null;
            } catch (e) {}

            const blockData = {
                id: block.id,
                type: block.type,
                content: block.content,
                formatting: formattingData
            };

            if (block.type === 'image' && block.image) {
                const img = block.image;
                blockData.data = {
                    fileName: img.original_name,
                    fileType: img.mime_type,
                    fileKey: img.file_key,
                    fileSize: formatFileSize(img.file_size),
                    size: img.file_size,
                    alt: img.alt_text,
                    naturalWidth: img.width,
                    naturalHeight: img.height
                };
            }

            return blockData;
        });

        return { meta, content };
    }
};