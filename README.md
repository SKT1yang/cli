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

# 预览模式，仅查看将要删除的内容
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

## 🔧 开发

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

## 📝 配置

可以通过配置文件自定义默认行为（配置功能开发中）。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👤 作者

yangguodong

## 🛠️ 技术栈

- **TypeScript** - 类型安全的 JavaScript 超集
- **commander** - CLI 框架
- **fast-glob** - 快速的 glob 模式匹配
- **Rolldown** - 构建工具
- **Bun Test** - 测试框架
- **oxlint** - 代码检查
- **oxfmt** - 代码格式化
- **husky + lint-staged** - Git Hooks 管理
