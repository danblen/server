import prisma from '../../../db/prisma.js';

// 删除匹配的数据库记录接口
export default async (imagesInfo) => {
  if (!imagesInfo || imagesInfo.length === 0) {
    return { message: '没有要删除的数据。' };
  }
  const deletedRecords = [];
  try {
    for (const imageInfo of imagesInfo.body) {
      const requestId = imageInfo.requestId;
      if (requestId) {
        // 查询数据库获取文件路径
        const record = await prisma.userProcessImageData.findFirst({
          where: {
            OR: [{ requestId: requestId }],
          },
        });

        if (record) {
          // 删除数据库记录
          const deletedRecord = await prisma.userProcessImageData.delete({
            where: {
              requestId: record.requestId,
            },
          });
          deletedRecords.push(deletedRecord);
        }
      }
    }

    return { message: `已成功删除 ${deletedRecords.length} 条记录。` };
  } catch (error) {
    console.error('删除匹配的数据库记录时出错：', error);
    return { message: '删除匹配的数据库记录时出错，请稍后重试。' };
  }
};
