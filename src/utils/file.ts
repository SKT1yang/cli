import { existsSync, lstatSync, unlink, rm } from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(unlink);
const rmAsync = promisify(rm);

/**
 * 检查路径是否为目录
 */
export function isDirectory(path: string): boolean {
  try {
    return lstatSync(path).isDirectory();
  } catch {
    return false;
  }
}

/**
 * 删除单个文件
 */
export async function deleteFile(filePath: string): Promise<void> {
  await unlinkAsync(filePath);
}

/**
 * 删除目录（递归）
 */
export async function deleteDir(dirPath: string): Promise<void> {
  await rmAsync(dirPath, { recursive: true, force: true });
}

/**
 * 检查文件或目录是否存在
 */
export function pathExists(path: string): boolean {
  return existsSync(path);
}
