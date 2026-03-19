import { randomUUID } from 'crypto'
import { mkdirSync, writeFileSync, existsSync, rmSync, readdirSync } from 'fs'
import { join } from 'path'

import { Command } from 'commander'

import { deleteCommand } from '../../src/commands/delete'
import type { CliConfig } from '../../src/config/types'

const TEST_BASE_DIR = join(process.cwd(), 'test-temp')

/**
 * 创建隔离的测试目录
 */
export function setupTestDir(): string {
	const dir = join(TEST_BASE_DIR, `cli-test-${randomUUID()}`)
	mkdirSync(dir, { recursive: true })
	return dir
}

/**
 * 清理测试目录
 */
export function cleanupTestDir(dir: string) {
	if (existsSync(dir)) {
		try {
			rmSync(dir, { recursive: true, force: true })
		} catch (error) {
			console.warn(`⚠️  清理测试目录失败：${dir}`)
			console.warn(`错误信息：${(error as Error).message}`)
		}
	}

	// 检查是否所有测试子目录都已清理，如果是，删除基础目录
	if (existsSync(TEST_BASE_DIR)) {
		const items = readdirSync(TEST_BASE_DIR)
		if (items.length === 0) {
			try {
				rmSync(TEST_BASE_DIR, { recursive: true, force: true })
			} catch (error) {
				console.warn(`⚠️  清理测试基础目录失败：${TEST_BASE_DIR}-${error}`)
			}
		}
	}
}

/**
 * 创建测试文件和文件夹
 */
export function createTestFiles(baseDir: string, files: Record<string, string | string[]>) {
	Object.entries(files).forEach(([filePath, content]) => {
		const fullPath = join(baseDir, filePath)

		// 如果是数组，表示是目录，需要创建子文件
		if (Array.isArray(content)) {
			mkdirSync(fullPath, { recursive: true })
			content.forEach((subFile, index) => {
				writeFileSync(join(fullPath, `file${index}.txt`), subFile)
			})
		} else {
			// 创建文件
			mkdirSync(join(fullPath, '..'), { recursive: true })
			writeFileSync(fullPath, content)
		}
	})
}

/**
 * 验证删除结果
 */
export function verifyDeletion(baseDir: string, paths: string[], shouldNotExist = true) {
	paths.forEach((filePath) => {
		const fullPath = join(baseDir, filePath)
		if (shouldNotExist) {
			if (!existsSync(fullPath)) {
				console.log(`✓ 已验证删除：${fullPath}`)
			} else {
				console.error(`✗ 应该被删除但仍然存在：${fullPath}`)
			}
		} else {
			if (existsSync(fullPath)) {
				console.log(`✓ 已验证保留：${fullPath}`)
			} else {
				console.error(`✗ 应该保留但已被删除：${fullPath}`)
			}
		}
	})
}

/**
 * 执行删除命令
 */
export async function runDeleteCommand(
	cwd: string,
	patterns: string[],
	options: Record<string, any> = {},
): Promise<void> {
	const originalCwd = process.cwd()
	const originalArgv = process.argv

	try {
		process.chdir(cwd)

		process.argv = [
			'bun',
			'test',
			'delete',
			...patterns,
			...(options.force ? ['-f'] : []),
			...(options.dryRun ? ['--dry-run'] : []),
			...(options.verbose ? ['--verbose'] : []),
		]

		const program = new Command()
		const config: CliConfig = {
			force: options.force ?? false,
			dryRun: options.dryRun ?? false,
			verbose: options.verbose ?? false,
			defaultPatterns: [],
		}

		deleteCommand(program, config)

		await program.parseAsync(process.argv)
	} finally {
		process.chdir(originalCwd)
		process.argv = originalArgv
	}
}

/**
 * 初始化测试环境（创建基础目录）
 */
export function initTestEnvironment() {
	mkdirSync(TEST_BASE_DIR, { recursive: true })
	console.log(`✓ 测试环境已初始化：${TEST_BASE_DIR}`)
}

/**
 * 清理整个测试环境
 */
export async function cleanupTestEnvironment() {
	await new Promise((resolve) => setTimeout(resolve, 200))
	if (existsSync(TEST_BASE_DIR)) {
		try {
			rmSync(TEST_BASE_DIR, { recursive: true, force: true })
			console.log(`✓ 测试环境已清理：${TEST_BASE_DIR}`)
		} catch (error) {
			console.warn(`⚠️  清理测试基础目录失败：${TEST_BASE_DIR}`)
			console.warn(`错误信息：${(error as Error).message}`)
		}
	}
}
