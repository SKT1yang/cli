/**
 * 日志工具函数
 */

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * 普通输出
 */
export function log(message: string = ''): void {
  console.log(message);
}

/**
 * 成功消息（绿色）
 */
export function success(message: string): void {
  console.log(`${colors.green}${message}${colors.reset}`);
}

/**
 * 错误消息（红色）
 */
export function error(message: string): void {
  console.error(`${colors.red}${message}${colors.reset}`);
}

/**
 * 警告消息（黄色）
 */
export function warn(message: string): void {
  console.warn(`${colors.yellow}${message}${colors.reset}`);
}

/**
 * 信息消息（蓝色）
 */
export function info(message: string): void {
  console.info(`${colors.blue}${message}${colors.reset}`);
}

/**
 * 调试消息（青色）
 */
export function debug(message: string): void {
  console.debug(`${colors.cyan}${message}${colors.reset}`);
}
