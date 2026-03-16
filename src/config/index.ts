import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { CliConfig } from './types';

const CONFIG_FILES = ['.clirc.json', 'cli.config.js', 'cli.config.ts', '.cli.config.mts'];

/**
 * 读取配置文件
 * @returns 配置对象
 */
export async function readConfig(): Promise<CliConfig> {
	const cwd = process.cwd();

	// 查找配置文件
	for (const configFile of CONFIG_FILES) {
		const configPath = join(cwd, configFile);

		if (!existsSync(configPath)) {
			continue;
		}

		try {
			let config: CliConfig;

			// 根据文件扩展名决定读取方式
			if (configFile.endsWith('.json')) {
				// JSON 文件使用 readFileSync
				const content = readFileSync(configPath, 'utf-8');
				config = JSON.parse(content);
			} else {
				// JS/TS 文件使用动态导入
				// eslint-disable-next-line no-await-in-loop
				const module = await import(configPath);
				config = module.default || module;
			}

			return config;
		} catch (err) {
			console.warn(`读取配置文件失败 (${configFile}): ${(err as Error).message}`);
		}
	}

	// 如果没有配置文件，返回默认配置
	return {
		force: false,
		dryRun: false,
		verbose: false,
	};
}
