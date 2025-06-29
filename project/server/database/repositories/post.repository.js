const fs = require('fs').promises;
const NodeCache = require('node-cache');
const logger = require("../../utils/logger");
const searchCache = new NodeCache({ stdTTL: 300 }); // Кеш на 5 минут

module.exports = (models, sequelize) => {
    // Ленивая инициализация sitemapService
    let sitemapService = null;

    const getSitemapService = () => {
        if (!sitemapService) {
            const sitemapGenerator = require('../../services/sitemapGenerator.service');
            sitemapService = sitemapGenerator(models);
        }
        return sitemapService;
    };

    return {
        async createPost(postData, authorId) {
            return sequelize.transaction(async (t) => {
                const post = await models.Post.create(
                    {
                        title: postData.meta.title,
                        description: postData.meta.description,
                        keywords: postData.meta.keywords,
                        author_id: authorId,
                        status: "published",
                    },
                    { transaction: t }
                );

                const blocks = await Promise.all(
                    postData.content.map(async (block, index) => {
                        const newBlock = await models.PostBlock.create(
                            {
                                id: block.id,
                                type: block.type,
                                content: block.content,
                                formatting: block.formatting,
                                order: index,
                                post_id: post.id,
                            },
                            { transaction: t }
                        );

                        if (block.type === 'image' && block.data) {
                            const imageData = block.data;
                            if (!imageData.fileKey || !imageData.fileType || !imageData.fileName) {
                                throw new Error('Недостаточно данных для создания изображения');
                            }

                            await models.PostImage.create(
                                {
                                    block_id: newBlock.id,
                                    post_id: post.id,
                                    original_name: imageData.fileName,
                                    file_key: imageData.fileKey,
                                    file_path: '',
                                    server_name: null,
                                    file_size: imageData.size,
                                    mime_type: imageData.fileType,
                                    alt_text: imageData.alt || '',
                                    width: imageData.naturalWidth || 0,
                                    height: imageData.naturalHeight || 0
                                },
                                { transaction: t }
                            );
                        }

                        return newBlock;
                    })
                );

                // Сброс кеша Sitemap после создания поста
                getSitemapService().resetCache();
                return post.id;
            });
        },

        async updatePost(postId, postData, userId, isAdmin) {
            const transaction = await sequelize.transaction();
            const filesToDelete = [];
            let postStatusChanged = false;

            try {
                const post = await models.Post.findByPk(postId, {
                    transaction,
                    include: [{
                        model: models.User,
                        as: 'author',
                        attributes: ['id']
                    }]
                });

                if (!post) throw new Error('POST_NOT_FOUND');
                if (post.author.id !== userId && !isAdmin) throw new Error('ACCESS_DENIED');

                // Сохраняем предыдущий статус для проверки изменений
                const previousStatus = post.status;

                await post.update({
                    title: postData.meta.title,
                    description: postData.meta.description,
                    keywords: postData.meta.keywords,
                    updated_at: new Date()
                }, { transaction });

                // Проверяем изменение статуса
                postStatusChanged = previousStatus !== 'published' && post.status === 'published';

                const currentBlocks = await models.PostBlock.findAll({
                    where: { post_id: postId },
                    include: [{ model: models.PostImage, as: 'image' }],
                    transaction
                });

                const existingBlocksMap = new Map(currentBlocks.map(block => [block.id, block]));
                const requestedBlocksMap = new Map(postData.content.map(block => [block.id, block]));

                const blocksToDelete = currentBlocks.filter(
                    block => !requestedBlocksMap.has(block.id)
                );

                for (const block of blocksToDelete) {
                    if (block.image) {
                        filesToDelete.push(block.image.file_path);
                        filesToDelete.push(`${block.image.file_path}.gz`);
                    }
                    await block.destroy({ transaction });
                    existingBlocksMap.delete(block.id);
                }

                for (const [index, blockData] of postData.content.entries()) {
                    const existingBlock = existingBlocksMap.get(blockData.id);
                    if (existingBlock) {
                        await existingBlock.update({
                            type: blockData.type,
                            content: blockData.content,
                            formatting: blockData.formatting,
                            order: index
                        }, { transaction });
                    }
                }

                for (const [index, blockData] of postData.content.entries()) {
                    if (!existingBlocksMap.has(blockData.id)) {
                        const createData = {
                            type: blockData.type,
                            content: blockData.content,
                            formatting: blockData.formatting,
                            order: index,
                            post_id: post.id,
                        };

                        if (blockData.id) createData.id = blockData.id;

                        const newBlock = await models.PostBlock.create(createData, { transaction });
                        existingBlocksMap.set(newBlock.id, newBlock);
                        blockData.id = newBlock.id;
                    }
                }

                for (const blockData of postData.content) {
                    if (blockData.type === 'image' && blockData.data) {
                        const blockId = blockData.id;
                        const imageData = blockData.data;

                        if (!imageData.fileKey || !imageData.fileType || !imageData.fileName) {
                            throw new Error('Недостаточно данных для обновления изображения');
                        }

                        const existingImage = await models.PostImage.findOne({
                            where: { block_id: blockId },
                            transaction
                        });

                        if (existingImage) {
                            const isNewFile = existingImage.file_key !== imageData.fileKey;

                            if (isNewFile && existingImage.file_path) {
                                filesToDelete.push(existingImage.file_path);
                                filesToDelete.push(`${existingImage.file_path}.gz`);
                            }

                            await existingImage.update({
                                original_name: imageData.fileName,
                                file_key: imageData.fileKey,
                                file_size: imageData.size,
                                mime_type: imageData.fileType,
                                alt_text: imageData.alt || '',
                                width: imageData.naturalWidth || 0,
                                height: imageData.naturalHeight || 0,
                                ...(isNewFile && { server_name: null, file_path: null })
                            }, { transaction });
                        } else {
                            await models.PostImage.create({
                                block_id: blockId,
                                post_id: post.id,
                                original_name: imageData.fileName,
                                file_key: imageData.fileKey,
                                server_name: null,
                                file_path: null,
                                file_size: imageData.size,
                                mime_type: imageData.fileType,
                                alt_text: imageData.alt || '',
                                width: imageData.naturalWidth || 0,
                                height: imageData.naturalHeight || 0
                            }, { transaction });
                        }
                    }
                }

                await transaction.commit();

                // Сброс кеша Sitemap если:
                // - Статус изменился на published
                // - Пост уже был published (любое обновление)
                if (postStatusChanged || previousStatus === 'published') {
                    getSitemapService().resetCache();
                }

                for (const filePath of filesToDelete) {
                    try {
                        await fs.rm(filePath, { force: true });
                    } catch (error) {
                        logger.error(error, `POST_REPOSITORY | Ошибка удаления файла ${filePath}`);
                    }
                }

                return true;
            } catch (error) {
                await transaction.rollback();
                logger.error(error, `POST_REPOSITORY | updatePost`);
                throw error;
            }
        },

        // Получает пост по ID со всеми зависимостями
        async getPostById(postId, includeBlocks = true, includeImages = true, includeAuthor = true) {
            const options = {
                where: { id: postId },
                include: [],
            };

            if (includeAuthor) {
                options.include.push({
                    model: models.User,
                    as: "author",
                    attributes: ["id", "username"],
                });
            }

            if (includeBlocks) {
                const blockInclude = {
                    model: models.PostBlock,
                    as: "blocks",
                    attributes: { exclude: ["post_id"] },
                    order: [["order", "ASC"]],
                };

                if (includeImages) {
                    blockInclude.include = [{
                        model: models.PostImage,
                        as: "image",
                        attributes: [
                            "id", "original_name", "mime_type", "file_size",
                            "alt_text", "width", "height", "file_key", "server_name"
                        ]
                    }];
                }

                options.include.push(blockInclude);
            }

            return models.Post.findOne(options);
        },

        // Удаляет пост и все связанные данные
        async deletePost(postId) {
            const transaction = await sequelize.transaction();

            try {
                const post = await models.Post.findByPk(postId, { transaction });
                if (!post) throw new Error('POST_NOT_FOUND');

                const wasPublished = post.status === 'published';

                const images = await models.PostImage.findAll({
                    where: { post_id: postId },
                    attributes: ['id', 'file_path'],
                    transaction
                });

                await models.PostBlock.destroy({ where: { post_id: postId }, transaction });
                await models.PostImage.destroy({ where: { post_id: postId }, transaction });
                await models.UserFavorite.destroy({ where: { post_id: postId }, transaction });
                await models.Post.destroy({ where: { id: postId }, transaction });

                await transaction.commit();

                // Сброс кеша Sitemap если пост был опубликован
                if (wasPublished) {
                    getSitemapService().resetCache();
                }

                return images;
            } catch (error) {
                await transaction.rollback();
                logger.error(error, `POST_REPOSITORY | deletePost`);
                throw error;
            }
        },

        // Получает посты по статусу с пагинацией
        async getPostsByStatus(offset, limit) {
            return await models.Post.findAll({
                where: { status: 'published' },
                include: [{
                    model: models.User,
                    as: 'author',
                    attributes: ['id', 'username']
                }],
                order: [['created_at', 'DESC']],
                limit,
                offset
            });
        },

        // Получает посты автора
        async getPostsByAuthor(authorId, status = null) {
            const where = { author_id: authorId };
            if (status) where.status = status;

            return models.Post.findAll({
                where,
                include: [{
                    model: models.User,
                    as: "author",
                    attributes: ["id", "username"],
                }],
                order: [["created_at", "DESC"]],
            });
        },

        // Получаем общее количество опубликованных постов
        async getPostsCount() {
            return await models.Post.count({
                where: { status: 'published' }
            });
        },

        async searchPosts(query, offset = 0, limit = 10) {
            // Создаем уникальный ключ для кеша
            const cacheKey = `search:${query}:${offset}:${limit}`;

            // Проверяем кеш
            const cachedResults = searchCache.get(cacheKey);
            if (cachedResults) {
                console.log(cachedResults);
                return cachedResults;
            }

            const { Op } = require('sequelize');

            // Ограничиваем количество постов для производительности
            const maxPosts = 100;
            const posts = await models.Post.findAll({
                where: { status: 'published' },
                include: [
                    {
                        model: models.User,
                        as: 'author',
                        attributes: ['username']
                    },
                    {
                        model: models.PostBlock,
                        as: 'blocks',
                        attributes: ['id', 'type', 'content'],
                        where: {
                            type: ['text', 'heading']
                        },
                        required: false
                    }
                ],
                attributes: ['id', 'title', 'description', 'created_at'],
                limit: maxPosts,
                subQuery: false
            });

            // Рассчитываем релевантность для каждого поста
            const results = posts.map(post => {
                // Собираем ВЕСЬ текст поста (включая блоки)
                const textBlocks = post.blocks
                .filter(b => b.content) // Фильтруем пустые блоки
                    .map(b => b.content);

                const fullText = [
                    post.title,
                    post.description,
                    ...textBlocks
                ]
                .filter(Boolean) // Удаляем пустые строки
                    .join(' ')
                    .toLowerCase();

                // Рассчитываем релевантность
                const relevance = calculateRelevance(fullText, query);

                return {
                    ...post.get({ plain: true }),
                    fullText,
                    relevance
                };
            })
            .filter(post => post.relevance > 0) // Фильтруем только релевантные
                .sort((a, b) => b.relevance - a.relevance) // Сортируем по релевантности
                .slice(offset, offset + limit); // Пагинация

            // Сохраняем в кеш
            searchCache.set(cacheKey, results);

            return results;
        },
    };
};

// Функция расчета релевантности
function calculateRelevance(text, query) {
    if (!text || !query) return 0;

    // Разбиваем запрос на слова (без фильтрации по длине)
    const words = query.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
        if (word.length < 2) return; // Пропускаем слишком короткие слова

        // Ищем все вхождения слова (без учета границ слов)
        const regex = new RegExp(escapeRegExp(word), 'gi');
        const matches = text.match(regex);

        if (matches) {
            // Вес = длина слова * количество вхождений
            score += word.length * matches.length;

            // Дополнительный бонус за точное совпадение
            if (text.includes(word)) {
                score += word.length * 2;
            }
        }
    });

    return score;
}

// Экранирование спецсимволов для RegExp
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}