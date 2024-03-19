import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

// 获取当前模块文件的路径
const currentModuleFileUrl = import.meta.url;

// 将文件 URL 转换为本地文件路径
const currentModuleFilePath = fileURLToPath(currentModuleFileUrl);

// 获取当前模块的目录路径
const currentModuleDir = dirname(currentModuleFilePath);

// 定义项目根目录为当前模块的上两级目录
export const projectRoot = path.resolve(currentModuleDir, '../../');
export const STATIC_DIR = projectRoot + '/static';

const ENV_MAP = {
  production: {
    SERVER_HOST: process.env.SERVER_HOST,
    SERVER_PORT: process.env.SERVER_PORT,
    API_TYPE: process.env.API_TYPE,
    URL_STATIC: process.env.URL_STATIC,
    GPU_HOST: process.env.GPU_HOST,
  },
  test: {
    SERVER_HOST: process.env.SERVER_HOST,
    SERVER_PORT: process.env.SERVER_PORT_TEST,
    API_TYPE: process.env.API_TYPE_TEST,
    URL_STATIC: process.env.URL_STATIC,
    GPU_HOST: process.env.GPU_HOST,
  },
  dev: {
    SERVER_HOST: process.env.SERVER_HOST_DEV,
    SERVER_PORT: process.env.SERVER_PORT_DEV,
    API_TYPE: process.env.API_TYPE_DEV,
    URL_STATIC: process.env.URL_STATIC_DEV,
    GPU_HOST: process.env.GPU_HOST,
  },
};
export const ENV = ENV_MAP[process.env.NODE_ENV];
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export const COSConfig = {
  SecretId: process.env.SecretId,
  SecretKey: process.env.SecretKey,
  // Region: process.env.Region,
  // Bucket: process.env.Bucket,
  // Domain: process.env.Domain,
};
