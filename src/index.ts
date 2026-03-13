import { Command } from 'commander';
import { deleteCommand } from './commands/index.js';
import { readConfig } from './config/index.js';

const program = new Command();

// 读取配置文件
const config = await readConfig();

program.name('shuiyangsuan').description('个人 CLI 工具 - 支持文件和文件夹删除等操作').version('0.0.1');

// 注册 delete 命令
deleteCommand(program, config);

program.parse();
