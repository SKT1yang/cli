import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { CliConfig } from './types';

const CONFIG_FILES = ['.clirc.json', '.clirc'];

/**
 * 读取配置文件
 * @returns 配置对象
 */
export async function readConfig(): Promise<CliConfig> {
  const cwd = process.cwd();

  // 查找配置文件
  for (const configFile of CONFIG_FILES) {
    const configPath = join(cwd, configFile);

    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf-8');
        const config: CliConfig = JSON.parse(content);
        return config;
      } catch (err) {
        console.warn(`读取配置文件失败 (${configFile}): ${(err as Error).message}`);
      }
    }
  }

  // 如果没有配置文件，返回默认配置
  return {
    force: false,
    dryRun: false,
    verbose: false,
  };
}
