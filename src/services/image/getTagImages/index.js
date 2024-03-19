import { STATIC_DIR } from '../../../config/index.js';
import prisma from '../../../db/prisma.js';

// 查询图片接口
export default async function getTagImages(req) {
  // export async function getTagImages(req) {
  try {
    const { tagName } = req.body;
    if (!tagName) {
      throw new Error('Missing required parameters or tagName is null');
    }

    // 查询数据库并限制结果数量为200个
    const tagPics = await prisma.imageUserUpload.findMany({
      where: {
        tagName: tagName,
        isChecked: true,
      },
      take: 200,
    });

    // 随机排序并选择前200个元素
    const shuffledTagPics = tagPics
      .sort(() => Math.random() - 0.5)
      .slice(0, 200);

    // 更新路径并返回结果
    const updatedTagPics = shuffledTagPics.map((pic) => {
      if (pic.momentPics && pic.userHeadPic) {
        // 将 momentPics 中的本地路径替换为绝对路径
        const updatedMomentPics = pic.momentPics.replace(
          STATIC_DIR,
          'https://facei.top/static'
        );

        const updatedHeadPic = pic.userHeadPic.replace(
          STATIC_DIR,
          'https://facei.top/static'
        );

        // 返回更新后的记录
        return {
          ...pic,
          momentPics: updatedMomentPics,
          userHeadPic: updatedHeadPic,
        };
      }
    });

    return { data: updatedTagPics };
  } catch (error) {
    // 处理错误信息
    console.error('Error saving momentPics to local filesystem:', error);
    return { error: error.message };
  } finally {
    // 关闭数据库连接等操作
    await prisma.$disconnect();
  }
}
