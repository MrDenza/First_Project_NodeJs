const sitemapGenerator = require('../services/sitemapGenerator.service');
const { models } = require("../database/database");
const logger = require("../utils/logger");

module.exports = async function handleSitemap(req, res) {
    const sitemapService = sitemapGenerator(models);
    try {
        const sitemap = await sitemapService.getSitemap();

        res.header('Content-Type', 'application/xml');
        res.header('Content-Encoding', 'gzip');
        res.send(sitemap);
    } catch (e) {
        logger.error(e, "SITEMAP_CONTROLLER");

        res.status(500).json({
            error: 'Ошибка генерации Sitemap',
            details: e.message
        });
    }
};