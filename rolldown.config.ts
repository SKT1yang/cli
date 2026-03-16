import { defineConfig, type RolldownOptions } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

const output: RolldownOptions['output'] = {
	sourcemap: true,
	format: 'es',
	minify: false,
	cleanDir: true,
	dir: 'dist',
};

export default defineConfig({
	input: './src/index.ts',
	output,
	plugins: [dts()],
	platform: 'node',
});
