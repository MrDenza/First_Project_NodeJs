const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');
const logger = require("../utils/logger");

module.exports = (models) => {
    let sitemap = null;
    let lastGenerated = 0;
    const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 часов кеширования

    const generateSitemap = async () => {
        try {
            const smStream = new SitemapStream({
                hostname: process.env.APP_URL,
                lastmodDateOnly: true
            });

            const pipeline = smStream.pipe(createGzip());

            // Статические страницы
            smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
            smStream.write({ url: '/register', changefreq: 'monthly', priority: 0.7 });
            smStream.write({ url: '/login', changefreq: 'monthly', priority: 0.7 });
            smStream.write({ url: '/feed', changefreq: 'hourly', priority: 0.9 });
            smStream.write({ url: '/posts/search', changefreq: 'monthly', priority: 0.7 });

            // Динамические страницы постов
            const posts = await models.Post.findAll({
                where: { status: 'published' },
                attributes: ['id', 'updated_at'],
                order: [['updated_at', 'DESC']],
                limit: 5000 // Ограничение для больших сайтов
            });

            posts.forEach(post => {
                smStream.write({
                    url: `/posts/view/${post.id}`,
                    lastmod: post.updated_at,
                    changefreq: 'weekly',
                    priority: 0.8
                });
            });

            smStream.end();
            return streamToPromise(pipeline);
        } catch (e) {
            logger.error(e, `SITEMAP_SERVICE`);
            throw e;
        }
    };

    return {
        getSitemap: async () => {
            if (!sitemap || Date.now() - lastGenerated > CACHE_DURATION) {
                sitemap = await generateSitemap();
                lastGenerated = Date.now();
                logger.info(`SITEMAP_SERVICE | Перегенерация: ${new Date()}`);
            }
            return sitemap;
        },
        resetCache: () => {
            sitemap = null;
            logger.info(`SITEMAP_SERVICE | Кеш сброшен`);
        }
    };
};