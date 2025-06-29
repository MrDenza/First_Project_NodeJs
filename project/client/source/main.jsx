import { createRoot, hydrateRoot } from "react-dom/client";
import "./main.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore } from './redux/store';
import { HelmetProvider } from "react-helmet-async";

const init100vh = () => {
	const setHeight = () => {
		const vh = window.innerHeight;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
	};
	setHeight();
	window.addEventListener('resize', setHeight);
};

const preloadedState = window.__PRELOADED_STATE__;
delete window.__PRELOADED_STATE__;
const store = createStore(preloadedState);

if (typeof window !== 'undefined') {
	init100vh();
}

const RootApp = () => (
	<HelmetProvider>
	<Provider store={store}>
		<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
			<App />
		</BrowserRouter>
	</Provider>
	</HelmetProvider>
);

// Рендер в зависимости от режима (Vite или SSR)
if (import.meta.env.MODE === 'development') {
	createRoot(document.getElementById('root')).render(<RootApp />);
} else {
	hydrateRoot(document.getElementById('root'), <RootApp />);
}