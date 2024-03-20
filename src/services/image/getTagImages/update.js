import prisma from '../../../db/prisma.js';

export default async () => {
  try {
    // 查询所有需要替换路径的图片记录
    const images = await prisma.imageUserUpload.findMany({
      // where: {
      //   momentPics: {
      //     contains: '/home/ubuntu/code/server/static/', // 包含旧路径的图片
      //   },
      // },
    });

    // 批量更新图片路径
    const updatedImages = await Promise.all(
      images.map(async (image) => {
        const updatedImage = await prisma.imageUserUpload.updateMany({
          data: {
            momentPics: '/' + image.momentPics,
            // userHeadPic: '/' + image.userHeadPic,
            // userHeadPic: image.userHeadPic.replace(
            //   '/home/ubuntu/code/server/static/',
            //   ''
            // ),
          },
          where: {
            momentId: image.momentId,
          },
        });
        return updatedImage;
      })
    );

    console.log('成功替换图片路径的记录数量:', updatedImages.length);
    return updatedImages;
  } catch (error) {
    console.error('替换图片路径时出错:', error);
    throw error;
  }
};
