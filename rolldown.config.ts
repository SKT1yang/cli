import { defineConfig, type RolldownOptions } from 'rolldown';

const output: RolldownOptions['output'] = {
	sourcemap: true,
	format: 'es',
	banner: `"use strict";\n`,
	minify: false,
	cleanDir: true,
	file: 'dist/index.js',
};

export default defineConfig({
	input: './src/index.ts',
	output,
	platform: 'node'
});
