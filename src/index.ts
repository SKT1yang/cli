import type { CliConfig } from './config/types';
import { Command } from 'commander';
import { deleteCommand, executeDelete, collectFilesToDelete } from './commands/index.js';
import { readConfig } from './config/index.js';
import type { DeleteOptions, DeleteResult } from './commands/index.js';

const program = new Command();

// 读取配置文件
const config = await readConfig();

program.name('shuiyangsuan').description('个人 CLI 工具 - 支持文件和文件夹删除等操作').version('0.0.1');

// 注册 delete 命令
deleteCommand(program, config);

// 仅在直接执行 CLI 时解析参数
if (process.argv[1] && process.argv[1].endsWith('/dist/index.js')) {
	program.parse();
}

export { CliConfig, deleteCommand, executeDelete, collectFilesToDelete, readConfig };
export type { DeleteOptions, DeleteResult };
