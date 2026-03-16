# 手动测试指南

## 概述

本目录包含用于调试 `delete` 命令的手动测试工具和辅助函数。

## 文件结构

```
__tests__/
├── utils/
│   └── helpers.ts              # 测试工具函数库
├── delete.test.ts              # 自动化单元测试
├── manual-test.ts              # 交互式手动测试脚本
├── manual-test-config.example.json  # 配置文件示例
└── MANUAL_TEST_README.md       # 本文档
```

## 快速开始

### 1. 运行交互式手动测试

```bash
# 基本用法 - 交互式选择测试场景
bun __tests__/manual-test.ts

# 或使用 npm script
npm run test:manual
```

### 2. 使用预设场景

```bash
# 基础删除测试
bun __tests__/manual-test.ts --scenario basic

# 混合类型测试
bun __tests__/manual-test.ts --scenario mixed

# 嵌套目录测试
bun __tests__/manual-test.ts --scenario nested

# 预览模式测试
bun __tests__/manual-test.ts --scenario dryrun
```

### 3. 使用配置文件

```bash
# 使用自定义配置文件
bun __tests__/manual-test.ts --config my-config.json
```

### 4. 调试模式（打断点）

```bash
# 启动调试服务器
bun --inspect __tests__/manual-test.ts

# 或使用 npm script
npm run test:debug
```

然后在 VSCode 中：
1. 在 `src/commands/delete.ts` 或其他源文件中设置断点
2. 运行调试命令
3. 按回车键触发执行
4. 断点会被命中，可以单步调试

## 可用测试场景

| 场景名称 | 描述 | 删除模式 |
|---------|------|---------|
| `basic` | 基础删除测试，删除所有 .txt 文件 | `*.txt` |
| `mixed` | 混合类型，同时删除文件和文件夹 | `single-file.txt`, `test-folder` |
| `nested` | 嵌套目录结构删除 | `level1` |
| `dryrun` | 预览模式，不实际删除 | `*.txt` (dry-run) |
| `custom` | 使用配置文件自定义 | 由配置定义 |

## 配置文件格式

创建 JSON 配置文件来自定义测试场景：

```json
{
  "name": "自定义测试",
  "description": "测试描述",
  "files": {
    "file1.txt": "内容 1",
    "folder1": ["subfile1.txt", "subfile2.txt"]
  },
  "patterns": ["*.txt", "folder1"],
  "options": {
    "force": true,
    "dryRun": false,
    "verbose": true
  },
  "cleanupAfter": true
}
```

### 配置选项说明

- **name**: 测试场景名称
- **description**: 测试场景描述
- **files**: 要创建的文件和文件夹结构
  - 字符串值表示创建文件
  - 数组值表示创建文件夹，数组元素为子文件名
- **patterns**: 删除命令使用的 glob 模式
- **options**: 删除命令选项
  - `force`: 强制删除，不提示确认
  - `dryRun`: 预览模式，不实际删除
  - `verbose`: 详细输出模式
- **cleanupAfter**: 测试完成后是否清理测试目录

## 测试工具函数

以下工具函数已抽取到 `utils/helpers.ts`，可在其他测试中使用：

### setupTestDir()
创建隔离的测试目录

```typescript
const testDir = setupTestDir();
```

### cleanupTestDir(dir)
清理指定的测试目录

```typescript
cleanupTestDir(testDir);
```

### createTestFiles(baseDir, files)
创建测试文件和文件夹

```typescript
createTestFiles(testDir, {
  'file.txt': 'content',
  'folder': ['file1.txt', 'file2.txt']
});
```

### verifyDeletion(baseDir, paths, shouldNotExist)
验证删除结果

```typescript
// 验证文件已被删除
verifyDeletion(testDir, ['file.txt'], true);

// 验证文件仍然存在
verifyDeletion(testDir, ['file.txt'], false);
```

### runDeleteCommand(cwd, patterns, options)
执行删除命令

```typescript
await runDeleteCommand(testDir, ['*.txt'], {
  force: true,
  verbose: true
});
```

### initTestEnvironment()
初始化测试环境（创建基础目录）

```typescript
initTestEnvironment();
```

### cleanupTestEnvironment()
清理整个测试环境

```typescript
await cleanupTestEnvironment();
```

## 调试工作流程

1. **准备阶段**
   ```bash
   # 选择一个测试场景
   bun __tests__/manual-test.ts --scenario basic
   ```

2. **设置断点**
   - 在 VSCode 中打开 `src/commands/delete.ts`
   - 在感兴趣的代码行设置断点

3. **启动调试**
   ```bash
   bun --inspect __tests__/manual-test.ts --scenario basic
   ```

4. **触发执行**
   - 脚本会显示将要执行的命令
   - 按回车键继续
   - 调试器会在断点处暂停

5. **检查结果**
   - 查看测试目录中的文件变化
   - 或在调试完成后选择清理

## 常见问题

### Q: 如何查看测试创建的临时文件？
A: 测试文件位于项目根目录的 `test-temp/` 目录下。可以在测试完成后选择不自动清理，手动查看。

### Q: 调试时断点没有被命中？
A: 确保使用 `bun --inspect` 启动，并且 VSCode 的调试器已连接。

### Q: 如何在测试中使用自定义配置？
A: 创建一个 JSON 配置文件，然后使用 `--config` 参数指定。

### Q: 测试失败后如何清理残留文件？
A: 手动删除 `test-temp/` 目录，或重新运行任意测试场景会自动清理。

## 最佳实践

1. **使用预设场景**：优先使用内置的测试场景，快速开始调试
2. **小步测试**：每次测试只验证一个功能点
3. **及时清理**：测试完成后及时清理临时文件
4. **使用版本控制**：将自定义配置文件加入版本控制，方便复用
5. **详细日志**：使用 `verbose: true` 选项查看详细执行过程

## 与其他工具的集成

### VSCode 调试配置

`.vscode/launch.json` 已包含调试配置，可以直接使用 F5 启动调试。

### Git 忽略

测试临时目录已通过 `.gitignore` 排除，不会提交到版本库。
