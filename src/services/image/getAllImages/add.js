import { getFilePathFromDir } from '../../../common/fileUtils.js';
import { STATIC_DIR } from '../../../config/index.js';
import prisma from '../../../db/prisma.js';

export default async () => {
  try {
    // 查询所有需要替换路径的图片记录
    // const images = await prisma.imageIndex.findMany({
    //   // where: {
    //   //   momentPics: {
    //   //     contains: '/home/ubuntu/code/server/static/', // 包含旧路径的图片
    //   //   },
    //   // },
    // });
    const filePaths = getFilePathFromDir(STATIC_DIR + '/allImages/banner/');
    console.log(filePaths);
    // 批量更新图片路径
    const updatedImages = await prisma.imageIndex.create({
      data: {
        imageUrl: '',
        category: 'banner',
      },
    });

    console.log('成功替换图片路径的记录数量:', updatedImages.length);
    return updatedImages;
  } catch (error) {
    console.error('替换图片路径时出错:', error);
    throw error;
  }
};
