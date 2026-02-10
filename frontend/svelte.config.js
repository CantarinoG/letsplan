import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-static config for SPA
		adapter: adapter({
			fallback: 'index.html'
		})
	}
};

export default config;
