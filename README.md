# @shuiyangsuan/cli

一个基于 Node.js 的命令行工具集，提供高效的文件管理功能。

## ✨ 特性

- 🚀 **快速删除** - 支持 glob 模式批量删除文件和文件夹
- 🔍 **预览模式** - dry-run 模式，删除前可预览将要删除的内容
- 🛡️ **安全保护** - 默认需要确认，防止误删
- 📦 **并行处理** - 并行执行删除操作，提升性能
- ⚡ **现代化工具栈** - 使用 TypeScript + Bun Test + Rolldown 构建

## 📦 安装

### 从 npm 安装（推荐）

```bash
npm install -g @shuiyangsuan/cli
```

### 从源码安装

```bash
git clone <repository-url>
cd cli
npm install
npm run build
npm link
```

## 🚀 使用方法

### 基本用法

```bash
# 删除单个文件
by delete file.txt

# 删除多个文件
by delete file1.txt file2.txt file3.log

# 删除文件夹
by delete my-folder/

# 使用别名
by rm file.txt
by del file.txt

# 无参数调用（使用配置文件中的 defaultPatterns）
by delete
```

### Glob 模式匹配

```bash
# 删除所有 .txt 文件
by delete "*.txt"

# 删除所有 .log 文件
by delete "**/*.log"

# 删除特定前缀的文件
by delete "test-*"

# 混合使用多个模式
by delete "*.tmp" "*.cache" "dist/**"
```

### 选项参数

```bash
# 强制删除，跳过确认提示
by delete "*.tmp" --force
by delete "*.tmp" -f

# 预览模式，仅显示将要删除的内容
by delete "*.tmp" --dry-run
by delete "*.tmp" -n

# 详细输出模式
by delete "*.tmp" --verbose
by delete "*.tmp" -v

# 使用配置文件中的默认设置
by delete "*.tmp" --use-defaults
by delete "*.tmp" -d
```

### 组合使用示例

```bash
# 预览并详细输出
by delete "dist/**" --dry-run --verbose

# 强制删除所有临时文件
by delete "*.tmp" "*.log" --force --verbose

# 删除构建产物（先预览确认）
by delete "dist" "build" ".next" --dry-run
```

## 🔧 编程模式

本 CLI 工具支持以编程方式调用，方便在其他 Node.js 项目中使用。

### 安装

```bash
npm install @shuiyangsuan/cli
```

### 基础用法

```typescript
import { executeDelete, readConfig } from '@shuiyangsuan/cli'

// 读取配置
const config = await readConfig()

// 执行删除
const result = await executeDelete(['node_modules', 'dist'], config, {
	force: true, // 强制删除，不提示确认
	verbose: true, // 详细输出
})

console.log(`成功删除 ${result.deletedCount} 个文件`)
console.log('删除的文件:', result.deletedFiles)
```

### 预览模式

```typescript
import { executeDelete, readConfig } from '@shuiyangsuan/cli'

const config = await readConfig()

// 预览将要删除的内容，不实际删除
const result = await executeDelete(['**/*.log', 'dist'], config, {
	dryRun: true,
	verbose: true,
})

console.log('将要删除的文件:', result.deletedFiles)
```

### 仅收集文件列表

```typescript
import { collectFilesToDelete } from '@shuiyangsuan/cli'

// 仅收集匹配的文件列表，不执行删除
const files = await collectFilesToDelete(['**/*.ts', '**/*.js'], {})

console.log('匹配的文件:')
files.forEach((file) => console.log(`  - ${file}`))
```

### 在构建脚本中使用

```typescript
// build.ts
import { executeDelete, readConfig } from '@shuiyangsuan/cli'
import { execSync } from 'child_process'

async function build() {
	const config = await readConfig()

	// 清理旧的构建产物
	await executeDelete(['dist', 'build'], config, {
		force: true,
		verbose: true,
	})

	// 执行构建
	execSync('tsc', { stdio: 'inherit' })

	console.log('构建完成!')
}

build().catch(console.error)
```

### 完整示例 - 带错误处理

```typescript
import { executeDelete, readConfig, type DeleteResult } from '@shuiyangsuan/cli'

async function cleanup() {
	try {
		const config = await readConfig()

		const result: DeleteResult = await executeDelete(['node_modules', 'dist', '**/*.log'], config, {
			force: false, // 需要确认
			verbose: true, // 详细输出
		})

		console.log('✅ 清理完成!')
		console.log(`成功：${result.deletedCount}, 失败：${result.failedCount}`)

		if (result.errors.length > 0) {
			console.error('错误信息:')
			result.errors.forEach((err) => console.error(`  - ${err}`))
		}
	} catch (error) {
		console.error('清理失败:', (error as Error).message)
		process.exit(1)
	}
}

cleanup()
```

### API 文档

#### executeDelete(patterns, config, options?)

执行删除操作的主要函数。

**参数：**

- `patterns`: string[] - 要删除的文件或文件夹路径/模式
- `config`: CliConfig - CLI 配置对象
- `options`: DeleteOptions (可选) - 删除选项

**返回值：** Promise<DeleteResult>

**DeleteResult 接口：**

```typescript
{
  deletedCount: number;    // 成功删除的数量
  failedCount: number;     // 失败的数量
  deletedFiles: string[];  // 删除的文件列表
  errors: string[];        // 错误信息列表
}
```

#### DeleteOptions

```typescript
{
  force?: boolean;       // 强制删除，不提示确认
  dryRun?: boolean;      // 预览模式，不实际删除
  verbose?: boolean;     // 详细输出模式
  useDefaults?: boolean; // 使用配置文件中的默认模式
}
```

#### collectFilesToDelete(patterns, options)

收集匹配的文件列表，但不执行删除。

**参数：**

- `patterns`: string[] - 文件或文件夹路径/模式
- `options`: DeleteOptions - 删除选项

**返回值：** Promise<string[]>

### 导入类型

```typescript
import type {
	DeleteOptions, // 删除选项
	DeleteResult, // 删除结果
	CliConfig, // 配置类型
} from '@shuiyangsuan/cli'
```

## 📝 配置文件

可以通过配置文件自定义默认行为。

### 配置文件格式

创建 `.clirc.json` 或 `cli.config.json`：

```json
{
	"defaultPatterns": ["node_modules/**", "dist/**", "**/.turbo"],
	"force": false,
	"dryRun": false,
	"verbose": true
}
```

### 配置项说明

- `defaultPatterns`: 默认的文件匹配模式列表
- `force`: 是否强制删除（跳过确认）
- `dryRun`: 预览模式（不实际删除）
- `verbose`: 详细输出模式

## 📖 命令说明

### delete (rm, del)

删除文件和文件夹，支持 glob 模式匹配。

**语法：**

```bash
by delete <patterns...> [options]
```

**参数：**

- `<patterns...>` - 要删除的文件或文件夹路径/模式（支持多个）

**选项：**

- `-f, --force` - 强制删除，不提示确认
- `-n, --dry-run` - 预览模式，仅显示将要删除的内容
- `-v, --verbose` - 详细输出模式
- `-d, --use-defaults` - 使用配置文件中的默认模式

**退出码：**

- `0` - 成功
- `1` - 失败或有错误发生

## 🧪 开发

### 环境要求

- Node.js >= 24.0.0
- Bun (用于测试)

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（监听变化自动构建）
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm test
# 或
bun test

# 运行手动测试
npm run test:manual

# 调试模式
npm run test:debug

# 代码检查
npm run lint

# 代码格式化
npm run fmt
```

### 项目结构

```
cli/
├── src/
│   ├── commands/       # CLI 命令定义
│   │   ├── index.ts    # 命令导出
│   │   └── delete.ts   # 删除命令实现
│   ├── config/         # 配置相关
│   │   ├── index.ts    # 配置加载
│   │   └── types.ts    # 配置类型
│   ├── utils/          # 工具函数
│   │   ├── file.ts     # 文件操作
│   │   └── logger.ts   # 日志输出
│   └── index.ts        # 入口文件
├── __tests__/          # 测试文件
│   ├── delete.test.ts  # 删除命令测试
│   └── utils/          # 测试工具函数
├── dist/               # 构建输出目录
└── package.json
```

## 🧪 测试

项目使用 Bun Test 进行测试，确保所有功能正常工作。

```bash
# 运行所有测试
bun test

# 测试覆盖率（未来添加）
bun test --coverage
```

测试覆盖以下场景：

- ✅ 基础删除功能（单文件、多文件、文件夹）
- ✅ 预览模式（dry-run）
- ✅ 强制删除模式
- ✅ 错误处理
- ✅ 复杂场景（嵌套目录、特殊字符文件名）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👤 作者

yangguodong

## 🛠️ 技术栈

- **TypeScript** - 类型安全的 JavaScript 超集
- **commander** - CLI 框架
- **tinyglobby** - 快速的 glob 模式匹配
- **Rolldown** - 构建工具
- **Bun Test** - 测试框架
- **oxlint** - 代码检查
- **oxfmt** - 代码格式化
- **husky + lint-staged** - Git Hooks 管理
