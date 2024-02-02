import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// 导出全局prisma实例，用来操作数据库
export default prisma;
