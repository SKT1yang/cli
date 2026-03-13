import { Command } from 'commander';
import fg from 'fast-glob';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { log, error, warn, success, info } from '../utils/logger.js';
import { deleteFile, deleteDir, isDirectory } from '../utils/file.js';
import type { CliConfig } from '../config/types.js';

interface DeleteOptions {
	force?: boolean;
	dryRun?: boolean;
	verbose?: boolean;
	useDefaults?: boolean;
}

export function deleteCommand(program: Command, config: CliConfig) {
	program
		.command('delete')
		.alias('rm')
		.alias('del')
		.description('删除文件和文件夹，支持 glob 模式匹配')
		.argument('<patterns...>', '要删除的文件或文件夹路径/模式')
		.option('-f, --force', '强制删除，不提示确认', config.force)
		.option('-n, --dry-run', '预览模式，仅显示将要删除的内容', config.dryRun)
		.option('-v, --verbose', '详细输出模式', config.verbose)
		.option('-d, --use-defaults', '使用配置文件中的默认模式')
		.action(async (patterns: string[], options: DeleteOptions) => {
			try {
				// 合并配置和命令行选项
				const finalOptions = {
					...config,
					...options,
				};

				// 如果使用默认配置
				let targetPatterns = patterns;
				if (finalOptions.useDefaults && config.defaultPatterns && config.defaultPatterns.length > 0) {
					targetPatterns = [...config.defaultPatterns, ...patterns];
				}

				if (targetPatterns.length === 0) {
					error('请指定要删除的文件或文件夹');
					process.exit(1);
				}

				// 收集所有要删除的路径
				const filesToDelete = await collectFilesToDelete(targetPatterns, finalOptions);

				if (filesToDelete.length === 0) {
					warn('没有找到匹配的文件或文件夹');
					return;
				}

				// 显示将要删除的内容
				if (finalOptions.dryRun || finalOptions.verbose) {
					info(`\n📋 将要删除 ${filesToDelete.length} 个项目:\n`);
					filesToDelete.forEach((file, index) => {
						log(`  ${index + 1}. ${file}`);
					});
					log('');
				}

				// 预览模式直接返回
				if (finalOptions.dryRun) {
					info('🔍 预览模式 - 没有实际删除任何文件');
					return;
				}

				// 确认删除
				if (!finalOptions.force) {
					const readline = await import('readline');
					const rl = readline.createInterface({
						input: process.stdin,
						output: process.stdout,
					});

					const answer = await new Promise<string>((resolve) => {
						rl.question('⚠️  确定要删除这些文件吗？(yes/no): ', (ans) => {
							rl.close();
							resolve(ans);
						});
					});

					if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
						info('❌ 已取消删除操作');
						return;
					}
				}

				// 执行删除
				let deletedCount = 0;
				let failedCount = 0;

				// 收集所有删除任务并并行执行
				const deleteTasks = filesToDelete.map(async (file) => {
					try {
						if (isDirectory(file)) {
							await deleteDir(file);
						} else {
							await deleteFile(file);
						}
						deletedCount++;
						if (finalOptions.verbose) {
							success(`✓ 已删除：${file}`);
						}
					} catch (err) {
						failedCount++;
						error(`✗ 删除失败：${file} - ${(err as Error).message}`);
					}
				});

				// 并行执行所有删除操作
				await Promise.all(deleteTasks);

				// 输出统计信息
				log('');
				success(`✅ 删除完成：成功 ${deletedCount} 个，失败 ${failedCount} 个`);

				if (failedCount > 0) {
					process.exit(1);
				}
			} catch (err) {
				error(`删除过程中出错：${(err as Error).message}`);
				process.exit(1);
			}
		});
}

async function collectFilesToDelete(patterns: string[], _options: DeleteOptions): Promise<string[]> {
	const filesToDelete = new Set<string>();

	// 收集所有匹配任务
	const matchTasks = patterns.map((pattern) => {
		// 检查是否是绝对路径
		const absolutePath = resolve(pattern);

		// 如果路径存在，直接添加
		if (existsSync(absolutePath)) {
			filesToDelete.add(absolutePath);
			return Promise.resolve();
		}

		// 使用 glob 匹配
		return fg(pattern, {
			cwd: process.cwd(),
			absolute: true,
			dot: true,
			ignore: ['**/node_modules/**', '**/.git/**'],
		})
			.then((matchedFiles) => {
				matchedFiles.forEach((file) => filesToDelete.add(file));
			})
			.catch((err) => {
				warn(`glob 匹配失败 (${pattern}): ${(err as Error).message}`);
			});
	});

	// 并行执行所有匹配任务
	await Promise.all(matchTasks);

	return Array.from(filesToDelete);
}
