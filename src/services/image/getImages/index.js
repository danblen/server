import { ENV, STATIC_DIR } from '../../../config/index.js';
import prisma from '../../../db/prisma.js';

// 查询图片接口
export default async (req) => {
  // export async function getTagImages(req) {
  try {
    const queryParamsArray = req.body;
    if (!queryParamsArray) {
      throw new Error('Missing required parameters or tagName is null');
    }
    const resultArray = [];

    // 对每个查询参数进行查询并添加到结果数组中
    await Promise.all(
      queryParamsArray.map(async (queryParams, index) => {
        // 执行查询图片记录
        const tagPics = await prisma.imageUserUpload.findMany({
          where: queryParams, // 使用传入的查询参数作为条件
          take: queryParams.take || 200, // 默认取 200 条记录
        });

        // 将查询结果添加到结果数组中
        resultArray[index] = tagPics;
      })
    );
    const result = resultArray.map((tagPicArray) =>
      tagPicArray.map((tagPic) => {
        tagPic.momentPics = `${ENV.URL_STATIC}${tagPic.momentPics}`;
        tagPic.userHeadPic = `${ENV.URL_STATIC}${tagPic.userHeadPic}`;
        // tagPic.momentPics = `${tagPic.momentPics}`;
        // tagPic.userHeadPic = `${tagPic.userHeadPic}`;
        return tagPic;
      })
    );
    // 随机排序并选择前200个元素
    const shuffledTagPics = result.map((tagPicArray) =>
      tagPicArray.sort(() => Math.random() - 0.5).slice(0, 200)
    );

    return { data: shuffledTagPics };
  } catch (error) {
    // 处理错误信息
    console.error('Error saving momentPics to local filesystem:', error);
    return { error: error.message };
  } finally {
    // 关闭数据库连接等操作
    await prisma.$disconnect();
  }
};
