#!/usr/bin/env bun

/**
 * 手动测试脚本 - 用于调试 delete 命令
 *
 * 使用方法:
 * 1. 直接运行：bun __tests__/manual-test.ts
 * 2. 指定配置：bun __tests__/manual-test.ts --config manual-test-config.json
 * 3. 调试模式：bun --inspect __tests__/manual-test.ts
 */

import { existsSync, mkdirSync, rmSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import { createTestFiles, cleanupTestDir } from './utils/helpers';

const TEST_DIR = join(process.cwd(), 'test-temp', 'manual-test');

interface TestConfig {
	name: string;
	description?: string;
	files: Record<string, string | string[]>;
	patterns: string[];
	options?: {
		force?: boolean;
		dryRun?: boolean;
		verbose?: boolean;
	};
	cleanupAfter?: boolean;
}

// 预定义的测试场景
const PRESET_SCENARIOS: Record<string, TestConfig> = {
	basic: {
		name: '基础删除测试',
		description: '测试基本的文件和文件夹删除功能',
		files: {
			'file1.txt': 'content 1',
			'file2.txt': 'content 2',
			'file3.log': 'content 3',
			dir1: ['subfile1.txt', 'subfile2.txt'],
		},
		patterns: ['*.txt'],
		options: { force: true, verbose: true },
		cleanupAfter: true,
	},
	mixed: {
		name: '混合类型测试',
		description: '测试同时删除文件和文件夹',
		files: {
			'single-file.txt': 'single file content',
			'test-folder': ['sub-file 1', 'sub-file 2'],
			'another.txt': 'another content',
		},
		patterns: ['single-file.txt', 'test-folder'],
		options: { force: true, verbose: true },
		cleanupAfter: true,
	},
	nested: {
		name: '嵌套目录测试',
		description: '测试删除深层嵌套的目录结构',
		files: {
			'level1/level2/level3': ['deep file content'],
			'other.txt': 'other content',
		},
		patterns: ['level1'],
		options: { force: true, verbose: true },
		cleanupAfter: true,
	},
	dryrun: {
		name: '预览模式测试',
		description: '测试预览模式（不实际删除）',
		files: {
			'preview1.txt': 'preview content 1',
			'preview2.txt': 'preview content 2',
		},
		patterns: ['*.txt'],
		options: { force: true, dryRun: true, verbose: true },
		cleanupAfter: false,
	},
	custom: {
		name: '自定义测试',
		description: '使用配置文件定义的结构',
		files: {},
		patterns: [],
		options: { force: true, verbose: true },
		cleanupAfter: true,
	},
};

/**
 * 创建测试目录结构
 */
function createTestEnvironment(config: TestConfig): string {
	console.log(`\n📁 创建测试环境：${config.name}`);
	if (config.description) {
		console.log(`   ${config.description}`);
	}

	// 清理旧的测试目录
	if (existsSync(TEST_DIR)) {
		rmSync(TEST_DIR, { recursive: true, force: true });
	}

	mkdirSync(TEST_DIR, { recursive: true });

	// 创建文件结构
	createTestFiles(TEST_DIR, config.files);

	console.log(`✓ 测试环境已创建：${TEST_DIR}`);
	console.log(`  创建了 ${Object.keys(config.files).length} 个文件/文件夹\n`);

	return TEST_DIR;
}

/**
 * 执行删除命令（调试模式）
 */
function runDebugCommand(patterns: string[], options: TestConfig['options'] = {}) {
	const args = ['src/index.ts', 'delete', ...patterns];

	if (options?.force) {
		args.push('-f');
	}
	if (options?.dryRun) {
		args.push('--dry-run');
	}
	if (options?.verbose) {
		args.push('--verbose');
	}

	const command = `bun --inspect ${args.join(' ')}`;

	console.log('\n🔍 准备执行调试命令:');
	console.log(`   ${command}\n`);
	console.log('💡 提示：现在可以在 VSCode 中设置断点，然后按回车键继续...');

	// 等待用户确认
	process.stdin.setEncoding('utf-8');
	process.stdout.write('\n按回车键继续执行调试命令...');

	return new Promise<void>((resolve) => {
		process.stdin.once('data', () => {
			console.log('\n🚀 正在启动调试模式...\n');
			try {
				// 使用 spawn 而不是 execSync，以便用户可以与调试器交互
				execSync(command, {
					stdio: 'inherit',
					cwd: process.cwd(),
				});
			} catch (error) {
				console.error('执行出错:', (error as Error).message);
			}
			resolve();
		});
	});
}

/**
 * 加载配置文件
 */
function loadConfigFile(configPath: string): TestConfig | null {
	const absolutePath = resolve(configPath);

	if (!existsSync(absolutePath)) {
		console.error(`❌ 配置文件不存在：${absolutePath}`);
		return null;
	}

	try {
		const configContent = require(absolutePath);
		return configContent as TestConfig;
	} catch (error) {
		console.error(`❌ 读取配置文件失败：${(error as Error).message}`);
		return null;
	}
}

/**
 * 显示可用的测试场景
 */
function showAvailableScenarios() {
	console.log('\n📋 可用的测试场景:\n');
	Object.entries(PRESET_SCENARIOS).forEach(([key, config], index) => {
		console.log(`  ${index + 1}. ${key} - ${config.name}`);
		if (config.description) {
			console.log(`     ${config.description}`);
		}
	});
	console.log('');
}

/**
 * 主函数
 */
async function main() {
	const args = process.argv.slice(2);
	let config: TestConfig | null = null;

	console.log('╔════════════════════════════════════════════╗');
	console.log('║   手动测试工具 - Delete 命令调试          ║');
	console.log('╚════════════════════════════════════════════╝\n');

	// 解析命令行参数
	if (args.includes('--help') || args.includes('-h')) {
		console.log('使用方法:');
		console.log('  bun __tests__/manual-test.ts                    # 交互式选择场景');
		console.log('  bun __tests__/manual-test.ts --scenario basic   # 使用预设场景');
		console.log('  bun __tests__/manual-test.ts --config xxx.json  # 使用配置文件');
		console.log('  bun __tests__/manual-test.ts --list             # 列出所有场景');
		console.log('\n可用场景：basic, mixed, nested, dryrun, custom');
		process.exit(0);
	}

	if (args.includes('--list')) {
		showAvailableScenarios();
		process.exit(0);
	}

	const scenarioIndex = args.indexOf('--scenario');
	if (scenarioIndex !== -1 && args[scenarioIndex + 1]) {
		const scenarioName = args[scenarioIndex + 1];
		config = PRESET_SCENARIOS[scenarioName] || null;

		if (!config) {
			console.error(`❌ 未知的场景：${scenarioName}`);
			showAvailableScenarios();
			process.exit(1);
		}
	}

	const configIndex = args.indexOf('--config');
	if (configIndex !== -1 && args[configIndex + 1]) {
		config = loadConfigFile(args[configIndex + 1]);
		if (!config) {
			process.exit(1);
		}
	}

	// 如果没有指定配置，进入交互式选择
	if (!config) {
		showAvailableScenarios();
		console.log('请输入场景编号或名称（回车使用 basic）:');

		process.stdin.setEncoding('utf-8');

		const userInput = await new Promise<string>((resolve) => {
			process.stdin.once('data', (data: string) => {
				resolve(data.toString().trim().toLowerCase());
			});
		});

		const selected = userInput || 'basic';
		const scenarioKey = Object.keys(PRESET_SCENARIOS).find(
			(key) => key === selected || PRESET_SCENARIOS[key].name === selected,
		);

		if (scenarioKey) {
			config = PRESET_SCENARIOS[scenarioKey];
		} else {
			console.error(`❌ 无效的选择：${selected}`);
			process.exit(1);
		}
	}

	// 确保配置有效
	if (!config || Object.keys(config.files).length === 0) {
		console.error('❌ 没有有效的测试配置');
		process.exit(1);
	}

	try {
		// 创建测试环境
		const testDir = createTestEnvironment(config);

		// 显示将要测试的内容
		console.log('📋 测试配置:');
		console.log(`   删除模式：${config.patterns.join(', ')}`);
		console.log(
			`   选项：force=${config.options?.force}, dryRun=${config.options?.dryRun}, verbose=${config.options?.verbose}`,
		);
		console.log(`   测试后清理：${config.cleanupAfter ? '是' : '否'}\n`);

		// 执行调试命令
		await runDebugCommand(config.patterns, config.options);

		// 验证结果（如果未使用 dryRun）
		if (!config.options?.dryRun) {
			console.log('\n✅ 调试完成！\n');
			console.log('💡 你可以在测试目录中查看剩余的文件:');
			console.log(`   ${testDir}\n`);

			if (config.cleanupAfter) {
				console.log('准备清理测试环境...');
				await new Promise<void>((resolve) => {
					process.stdout.write('按回车键清理测试环境 (Ctrl+C 取消)...');
					process.stdin.once('data', () => {
						cleanupTestDir(testDir);
						resolve();
					});
				});
			}
		} else {
			console.log('\n✅ 预览模式测试完成！');
			console.log('💡 文件未被删除，可以手动检查或使用其他模式测试\n');
		}
	} catch (error) {
		console.error('\n❌ 测试过程中出错:', (error as Error).message);
		process.exit(1);
	}

	console.log('\n✨ 手动测试结束！\n');
}

// 运行主函数
main().catch((error) => {
	console.error('发生错误:', error);
	process.exit(1);
});
