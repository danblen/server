import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

// 获取当前模块文件的路径
const currentModuleFileUrl = import.meta.url;

// 将文件 URL 转换为本地文件路径
const currentModuleFilePath = fileURLToPath(currentModuleFileUrl);

// 获取当前模块的目录路径
const currentModuleDir = dirname(currentModuleFilePath);

// 定义项目根目录为当前模块的上两级目录
export const projectRoot = path.resolve(currentModuleDir, '../../');
