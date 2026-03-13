export interface CliConfig {
  /** 默认的 glob 模式 */
  defaultPatterns?: string[];
  /** 默认的删除路径 */
  defaultPaths?: string[];
  /** 是否强制删除不提示 */
  force?: boolean;
  /** 预览模式 */
  dryRun?: boolean;
  /** 详细日志输出 */
  verbose?: boolean;
}
