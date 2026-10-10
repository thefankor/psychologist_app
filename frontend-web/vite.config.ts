import { defineConfig } from 'vite';
import { loadEnv } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

function figmaAssetResolver() {
	return {
		name: 'figma-asset-resolver',
		resolveId(id) {
			if (id.startsWith('figma:asset/')) {
				const filename = id.replace('figma:asset/', '');
				return path.resolve(__dirname, 'src/assets', filename);
			}
		},
	};
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, __dirname, '');
	const backendProxyUrl =
		env.VITE_BACKEND_PROXY_URL || 'http://localhost:8000';

	return {
		plugins: [figmaAssetResolver(), react(), tailwindcss()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
		server: {
			host: '0.0.0.0',
			port: 5173,
			allowedHosts: true,
			proxy: {
				'^/(auth|user|chats|calls|admin|psychologists)/.*': {
					target: backendProxyUrl,
					changeOrigin: true,
				},
				'/ws': {
					target: backendProxyUrl.replace(/^http/, 'ws'),
					ws: true,
					changeOrigin: true,
				},
			},
		},
		assetsInclude: ['**/*.svg', '**/*.csv'],
	};
});
