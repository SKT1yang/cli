import { Command } from 'commander'

import pkg from '../package.json'
import { deleteCommand } from './commands/index'
import { readConfig } from './config/index'

const program = new Command()

// 读取配置文件
const config = await readConfig()

program.name('shuiyangsuan').description('个人 CLI 工具 - 支持文件和文件夹删除等操作').version(pkg.version)

// 注册 delete 命令
deleteCommand(program, config)

program.parse()
