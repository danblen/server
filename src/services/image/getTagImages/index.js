import { STATIC_DIR } from '../../../config/index.js';
import prisma from '../../../db/prisma.js';

// 查询图片接口
export default async function getTagImages(req) {
  try {
    const { tagName } = req.body;
    if (!tagName) {
      throw new Error('Missing required parameters or tagName is null');
    }
    // *************************查找userId并更新*************************
    const tagPics = await prisma.imageUserUpload.findMany({
      where: {
        tagName: tagName,
        isChecked: true, //人工审核才会置true
      },
    });
    const updatedTagPics = tagPics.map((pic) => {
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

// export async function getTagImages(req) {
//   try {
//     const { tagName } = req.body;
//     // console.log(req.body);
//     if (!tagName) {
//       throw new Error('Missing required parameters or tagName is null');
//     }
//     // *************************查找userId并更新*************************
//     const tagPics = await prisma.imageUserUpload.findMany({
//       where: {
//         tagName: tagName,
//         isChecked: true, //人工审核才会置true
//       },
//     });
//     const updatedTagPics = tagPics.map((pic) => {
//       // 将 momentPics 中的本地路径替换为绝对路径
//       const updatedMomentPics = pic.momentPics.replace(
//         STATIC_DIR,
//         'https://facei.top/static'
//       );

//       const updatedHeadPic = pic.userHeadPic.replace(
//         STATIC_DIR,
//         'https://facei.top/static'
//       );

//       // 返回更新后的记录
//       return {
//         ...pic,
//         momentPics: updatedMomentPics,
//         userHeadPic: updatedHeadPic,
//       };
//     });

//     return { data: updatedTagPics };
//   } catch (error) {
//     // 处理错误信息
//     console.error('Error saving momentPics to local filesystem:', error);
//     return { error: error.message };
//   } finally {
//     // 关闭数据库连接等操作
//     await prisma.$disconnect();
//   }
// }
