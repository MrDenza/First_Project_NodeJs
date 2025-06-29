const fs = require('fs').promises;
const { INDEX_HTML, SSR_CLIENT_FILE } = require("../config/paths.config");
const { Writable } = require('stream');
const { renderToPipeableStream } = require('react-dom/server');
const { createApp } = require(SSR_CLIENT_FILE);
const logger = require("../utils/logger");

const HTML_MARKER_APP = '<!--app-html-->';
const HTML_MARKER_SCRIPT = '/*--preloaded-state--*/';
const HTML_MARKER_META = '<!--meta-tags-->';

async function handleSSR(req, res) {
    const context = {};
    console.time('renderTimer');
    logger.info(`Рендер: ${req.originalUrl}`);

    let template;
    try {
        template = await fs.readFile(INDEX_HTML, 'utf-8');
    } catch (err) {
        logger.error(err, "SSR_CONTROLLER | Ошибка чтения шаблона index.html");
        return res.redirect(302, '/index.html');
    }

    try {
        const app = await createApp(req, context);
        const preloadedState = context.preloadedState;
        let didError = false;

        const stream = renderToPipeableStream(app, {
            onShellReady() {
                if (context.url) {
                    return res.redirect(context.statusCode || 302, context.url);
                }

                // Получаем Helmet данные из контекста
                const helmetData = context.helmetContext?.helmet || {};

                // Формируем HTML для метатегов
                const metaHTML = `
                    ${helmetData.title?.toString() || ''}
                    ${helmetData.meta?.toString() || ''}
                    ${helmetData.link?.toString() || ''}
                `;

                // Вставляем метатеги в шаблон
                const templateWithMeta = template
                .replace(HTML_MARKER_META, metaHTML);

                const [beforeRoot, afterRoot] = templateWithMeta.split(HTML_MARKER_APP);
                const [rootDiv, afterState] = afterRoot.split(HTML_MARKER_SCRIPT);

                res.status(context.statusCode || (didError ? 500 : 200)).set({
                    'Content-Type': 'text/html; charset=UTF-8',
                    'X-Content-Type-Options': 'nosniff'
                });

                res.write(beforeRoot);

                const writable = new Writable({
                    write(chunk, encoding, callback) {
                        res.write(chunk, encoding, callback);
                    },
                    final(callback) {
                        const safeState = JSON.stringify(preloadedState || {})
                        .replace(/</g, '\\u003c')
                        .replace(/>/g, '\\u003e');
                        res.write(`
                            ${rootDiv}
                                window.__PRELOADED_STATE__ = ${safeState};
                            ${afterState}
                        `);

                        res.end();
                        callback();
                    }
                });
                stream.pipe(writable);
            },

            onShellError(err) {
                logger.error(err, "SSR_CONTROLLER | SSR shell error");
                res.status(200).send(template); // fallback
            },

            onError(error) {
                didError = true;
                logger.error(error, "SSR_CONTROLLER | SSR render error");
            }
        });
        console.timeEnd('renderTimer');
        req.on('close', () => stream.abort());

        setTimeout(() => {
            if (!res.headersSent) {
                stream.abort();
                res.status(200).send(template); // fallback
            }
        }, 10000);

    } catch (err) {
        logger.error(err, "SSR_CONTROLLER");
        res.status(200).send(template); // fallback
    }
}

module.exports = handleSSR;