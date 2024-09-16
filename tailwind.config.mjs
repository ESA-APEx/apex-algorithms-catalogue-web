/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'brand-teal': {
					10: '#f3f7f8',
					20: '#e2e6e7',
					30: '#79949f',
					50: '#00ae9d',
					70: '#204a5b',
					80: '#003247',
				},
				'brand-gray': {
					50: '#8299a3'
				}
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography')
	],
}
