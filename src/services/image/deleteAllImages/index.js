import prisma from '../../../db/prisma.js';

// 根据用户ID删除所有图像接口
export default async (query) => {
  const { userId } = query.body;
  if (!userId) {
    return { message: '没有要删除的数据。' };
  }
  try {
    // 查询数据库获取所有需要删除的记录
    const records = await prisma.userProcessImageData.findMany({
      where: {
        userId: userId,
      },
    });

    // 删除文件
    // 在这里加入删除文件的逻辑

    // 执行删除操作
    const deleteResult = await prisma.userProcessImageData.deleteMany({
      where: {
        userId: userId,
      },
    });

    return { message: `用户 ${userId} 的所有图像已删除。` };
  } catch (error) {
    console.error('删除数据时发生错误：', error);
    return { message: '删除数据时发生错误，请稍后重试。' };
  }
};
