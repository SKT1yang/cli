import type { CliConfig } from './config/types';
import { deleteCommand, executeDelete, collectFilesToDelete } from './commands/index';
import { readConfig } from './config/index';
import type { DeleteOptions, DeleteResult } from './commands/index';

export { CliConfig, deleteCommand, executeDelete, collectFilesToDelete, readConfig };
export type { DeleteOptions, DeleteResult };
