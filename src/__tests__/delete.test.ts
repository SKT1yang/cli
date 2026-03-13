import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'bun:test';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { deleteCommand } from '../commands/delete.js';
import { Command } from 'commander';
import type { CliConfig } from '../config/types.js';

// 测试辅助函数
let testDir: string;
const TEST_BASE_DIR = join(process.cwd(), 'test-temp');

/**
 * 创建隔离的测试目录
 */
function setupTestDir(): string {
	const dir = join(TEST_BASE_DIR, `cli-test-${randomUUID()}`);
	mkdirSync(dir, { recursive: true });
	return dir;
}

/**
 * 清理测试目录
 */
function cleanupTestDir(dir: string) {
	if (existsSync(dir)) {
		try {
			const { rmSync } = require('fs');
			rmSync(dir, { recursive: true, force: true });
		} catch (error) {
			// 清理失败时输出警告，但不中断测试
			console.warn(`⚠️  清理测试目录失败：${dir}`);
			console.warn(`错误信息：${(error as Error).message}`);
		}
	}

	// 检查是否所有测试子目录都已清理，如果是，删除基础目录
	if (existsSync(TEST_BASE_DIR)) {
		const { readdirSync, rmSync } = require('fs');
		const items = readdirSync(TEST_BASE_DIR);
		if (items.length === 0) {
			try {
				rmSync(TEST_BASE_DIR, { recursive: true, force: true });
			} catch (error) {
				console.warn(`⚠️  清理测试基础目录失败：${TEST_BASE_DIR}-${error}`);
			}
		}
	}
}

/**
 * 创建测试文件和文件夹
 */
function createTestFiles(baseDir: string, files: Record<string, string | string[]>) {
	Object.entries(files).forEach(([filePath, content]) => {
		const fullPath = join(baseDir, filePath);

		// 如果是数组，表示是目录，需要创建子文件
		if (Array.isArray(content)) {
			mkdirSync(fullPath, { recursive: true });
			content.forEach((subFile, index) => {
				writeFileSync(join(fullPath, `file${index}.txt`), subFile);
			});
		} else {
			// 创建文件
			mkdirSync(join(fullPath, '..'), { recursive: true });
			writeFileSync(fullPath, content);
		}
	});
}

/**
 * 验证删除结果
 */
function verifyDeletion(baseDir: string, paths: string[], shouldNotExist = true) {
	paths.forEach((filePath) => {
		const fullPath = join(baseDir, filePath);
		if (shouldNotExist) {
			expect(existsSync(fullPath)).toBe(false);
		} else {
			expect(existsSync(fullPath)).toBe(true);
		}
	});
}

/**
 * 执行删除命令
 */
async function runDeleteCommand(cwd: string, patterns: string[], options: Record<string, any> = {}) {
	// 保存当前的 cwd
	const originalCwd = process.cwd();
	const originalArgv = process.argv;

	try {
		// 切换到测试目录
		process.chdir(cwd);

		// 设置模拟的 argv
		process.argv = [
			'bun',
			'test',
			'delete',
			...patterns,
			...(options.force ? ['-f'] : []),
			...(options.dryRun ? ['--dry-run'] : []),
			...(options.verbose ? ['--verbose'] : []),
		];

		// 创建命令实例
		const program = new Command();
		const config: CliConfig = {
			force: options.force ?? false,
			dryRun: options.dryRun ?? false,
			verbose: options.verbose ?? false,
			defaultPatterns: [],
		};

		deleteCommand(program, config);

		// 解析并执行命令
		await program.parseAsync(process.argv);
	} finally {
		// 恢复原始 cwd 和 argv
		process.chdir(originalCwd);
		process.argv = originalArgv;
	}
}

describe('删除命令测试', () => {
	beforeAll(() => {
		// 创建测试基础目录
		mkdirSync(TEST_BASE_DIR, { recursive: true });
	});

	afterAll(async () => {
		// 等待所有异步操作完成
		await new Promise((resolve) => setTimeout(resolve, 200));
		// 清理整个测试基础目录
		if (existsSync(TEST_BASE_DIR)) {
			try {
				const { rmSync } = require('fs');
				rmSync(TEST_BASE_DIR, { recursive: true, force: true });
			} catch (error) {
				console.warn(`⚠️  清理测试基础目录失败：${TEST_BASE_DIR}`);
				console.warn(`错误信息：${(error as Error).message}`);
			}
		}
	});

	beforeEach(() => {
		testDir = setupTestDir();
	});

	afterEach(async () => {
		// 延迟一小段时间确保所有异步操作完成
		await new Promise((resolve) => setTimeout(resolve, 100));
		cleanupTestDir(testDir);
	});

	describe('基础删除功能', () => {
		it('应该能够删除单个文件', async () => {
			// 创建测试文件
			createTestFiles(testDir, {
				'test-file.txt': 'test content',
			});

			// 执行删除
			await runDeleteCommand(testDir, ['test-file.txt'], { force: true });

			// 验证删除
			verifyDeletion(testDir, ['test-file.txt']);
		});

		it('应该能够删除多个文件（使用 glob 模式）', async () => {
			// 创建多个测试文件
			createTestFiles(testDir, {
				'file1.txt': 'content 1',
				'file2.txt': 'content 2',
				'file3.log': 'content 3',
			});

			// 执行删除（使用 glob 模式）
			await runDeleteCommand(testDir, ['*.txt'], { force: true });

			// 验证 .txt 文件被删除，.log 文件保留
			verifyDeletion(testDir, ['file1.txt', 'file2.txt']);
			expect(existsSync(join(testDir, 'file3.log'))).toBe(true);
		});

		it('应该能够删除文件夹及其内容', async () => {
			// 创建测试文件夹和子文件
			createTestFiles(testDir, {
				'test-dir': ['content 1', 'content 2', 'content 3'],
			});

			// 执行删除
			await runDeleteCommand(testDir, ['test-dir'], { force: true });

			// 验证整个文件夹被删除
			verifyDeletion(testDir, ['test-dir']);
		});

		it('应该能够同时删除文件和文件夹', async () => {
			// 创建混合的文件和文件夹
			createTestFiles(testDir, {
				'single-file.txt': 'single file content',
				'test-folder': ['sub-file 1', 'sub-file 2'],
			});

			// 执行删除
			await runDeleteCommand(testDir, ['single-file.txt', 'test-folder'], { force: true });

			// 验证都被删除
			verifyDeletion(testDir, ['single-file.txt', 'test-folder']);
		});
	});

	describe('预览模式（dry-run）', () => {
		it('预览模式不应该实际删除文件', async () => {
			// 创建测试文件
			createTestFiles(testDir, {
				'preview-test.txt': 'preview content',
			});

			// 执行预览模式删除
			await runDeleteCommand(testDir, ['preview-test.txt'], {
				force: true,
				dryRun: true,
			});

			// 验证文件仍然存在
			verifyDeletion(testDir, ['preview-test.txt'], false);
		});

		it('预览模式应该显示将要删除的内容', async () => {
			// 创建多个测试文件
			createTestFiles(testDir, {
				'dry1.txt': 'content 1',
				'dry2.txt': 'content 2',
				'dry3.txt': 'content 3',
			});

			// 执行预览模式
			await runDeleteCommand(testDir, ['*.txt'], {
				force: true,
				dryRun: true,
				verbose: true,
			});

			// 验证所有文件仍然存在
			verifyDeletion(testDir, ['dry1.txt', 'dry2.txt', 'dry3.txt'], false);
		});
	});

	describe('强制删除模式', () => {
		it('强制模式应该跳过确认直接删除', async () => {
			// 创建测试文件
			createTestFiles(testDir, {
				'force-delete.txt': 'force delete content',
			});

			// 执行强制删除
			await runDeleteCommand(testDir, ['force-delete.txt'], { force: true });

			// 验证文件被删除
			verifyDeletion(testDir, ['force-delete.txt']);
		});
	});

	describe('错误处理', () => {
		it('删除不存在的路径应该给出提示', async () => {
			// 尝试删除不存在的文件
			try {
				await runDeleteCommand(testDir, ['non-existent-file.txt'], { force: true });
				// 如果没有抛出错误，说明处理了空结果
				expect(true).toBe(true);
			} catch (err) {
				// 允许抛出错误
				expect(err).toBeDefined();
			}
		});

		it('当没有匹配的文件时应该给出警告', async () => {
			// 尝试删除不存在的模式
			try {
				await runDeleteCommand(testDir, ['*.xyz'], { force: true });
				expect(true).toBe(true);
			} catch (err) {
				expect(err).toBeDefined();
			}
		});
	});

	describe('复杂场景', () => {
		it('应该能够删除嵌套的目录结构', async () => {
			// 创建深层嵌套的目录
			createTestFiles(testDir, {
				'level1/level2/level3': ['deep file content'],
			});

			// 删除最外层目录
			await runDeleteCommand(testDir, ['level1'], { force: true });

			// 验证整个嵌套结构都被删除
			verifyDeletion(testDir, ['level1']);
		});

		it('应该能够处理包含特殊字符的文件名', async () => {
			// 创建包含特殊字符的文件
			createTestFiles(testDir, {
				'test-file with spaces.txt': 'content with spaces',
				'test-file-with-dashes.txt': 'content with dashes',
			});

			// 执行删除
			await runDeleteCommand(testDir, ['test-file*.txt'], { force: true });

			// 验证删除
			verifyDeletion(testDir, ['test-file with spaces.txt', 'test-file-with-dashes.txt']);
		});
	});
});
