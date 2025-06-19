import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

const isSSR = process.env.BUILD_TARGET === 'ssr';

export default defineConfig({
	ssr: {
		noExternal: ['react-router-dom'],
		external: ['*.png', '*.jpg', '*.svg', '*.css', '*.woff2', '*.ico'] // <-- важно
	},
	plugins: [react()],
	base: "/",
	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx"],
	},
	server: {
		port: 3000,
		proxy: {
			'/go': {
				target: 'http://localhost:3100', // Адрес бэкенд-сервера
				changeOrigin: true, // Изменяет заголовок Origin на целевой URL
				rewrite: (path) => path.replace(/^\/go/, ''), // Убирает префикс /api из пути
			},
		},
		hmr: true, // Включение HMR для SSR
	},
	cacheDir: './.vite',
	publicDir: isSSR ? false : "source/static/",
	build: {
		outDir: isSSR ? './public/ssr' : './public',
		chunkSizeWarningLimit: 1000,
		assetsDir: "",
		optimizeDeps: {
			include: ["your-dependency-name"],
		},
		assetsInlineLimit: 0,
		minify: false,
		sourcemap: true,
		ssr: isSSR ? 'source/entry-server.jsx' : false,
		ssrEmitAssets: false,
		rollupOptions: {
			input: !isSSR
				// eslint-disable-next-line no-undef
				? { main: resolve(__dirname, 'index.html') }
				: undefined,
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						return "n-modules";
					}
				},
				format: isSSR ? 'cjs' : undefined,
				entryFileNames: isSSR
					? "ssr-[name].js"
					: "scripts/script-[name].js",
				chunkFileNames: isSSR
					? "ssr-[name].js"
					: "scripts/script-[name].js",
				assetFileNames: isSSR
					? ''
					: (assetInfo) => {
						const info = assetInfo.name.split(".");
						const extType = info[info.length - 1];
						if (/\.(png|jpe?g|gif|svg|webp|webm|tiff|bmp|ico)$/.test(assetInfo.name)) {
							return `images/[name].${extType}`;
						}
						if (/\.(css)$/.test(assetInfo.name)) {
							return `css/styles-[name].${extType}`;
						}
						if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
							return `fonts/[name].${extType}`;
						}
						return `[name].${extType}`;
					},
			},
		},
	}
});