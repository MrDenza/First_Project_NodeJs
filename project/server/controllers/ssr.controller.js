const fs = require('fs').promises;
const { INDEX_HTML, SSR_CLIENT_FILE } = require("../config/paths.config");
const { Writable } = require('stream');
const { renderToPipeableStream } = require('react-dom/server');
const { createApp } = require(SSR_CLIENT_FILE);


const HTML_MARKER_APP = '<!--app-html-->';
const HTML_MARKER_SCRIPT = '/*--preloaded-state--*/';

async function handleSSR(req, res) {
    const context = {};
    console.time('renderTimer');

    let template;
    try {
        template = await fs.readFile(INDEX_HTML, 'utf-8');
    } catch (err) {
        console.error('Ошибка чтения шаблона index.html: ', err);
        return res.redirect(302, '/index.html');
    }

    const [beforeRoot, afterRoot] = template.split(HTML_MARKER_APP);
    const [rootDiv, afterState]  = afterRoot.split(HTML_MARKER_SCRIPT);

    try {
        const app = await createApp(req, context);

        const preloadedState = context.preloadedState;
        let didError = false;

        const stream = renderToPipeableStream(app, {
            onShellReady() {
                if (context.url) {
                    return res.redirect(context.statusCode || 302, context.url);
                }

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
                console.error('SSR shell error:', err);
                res.status(200).send(template); // fallback
            },

            onError(error) {
                didError = true;
                console.error('SSR render error:', error);
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
        console.error('Ошибка в createApp или рендере:', err);
        res.status(200).send(template); // fallback
    }
}

module.exports = handleSSR;