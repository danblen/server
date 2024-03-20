import { getFilePathFromDir } from '../../../common/fileUtils.js';
import { STATIC_DIR } from '../../../config/index.js';
import prisma from '../../../db/prisma.js';
import { generateUniqueId } from '../../../common/utils.js';

export default async () => {
  try {
    // const filePaths = getFilePathFromDir(STATIC_DIR + '/uploads/海/');
    // console.log(filePaths);
    // 批量更新图片路径
    // 构建要创建的数据数组
    // const imageData = filePaths.map((filePath) => ({
    //   imageUrl: filePath.replace(STATIC_DIR, ''),
    //   category: 'albums',
    //   data: filePath,
    // }));

    // const imageData = filePaths.map((filePath) =>
    //   filePath.replace(STATIC_DIR, '')
    // );
    // // 批量创建图片索引记录
    // imageData.map(async (image) => {
    //   const createdImages = await prisma.imageUserUpload.create({
    //     data: {
    //       momentPics: image,
    //       momentTitle: '',
    //       tagName: '海',
    //       momentText: '总有人找到你，了解你，欣赏你，温暖你',
    //       userId: generateUniqueId().slice(0, 8),
    //       momentId: generateUniqueId().slice(6, 16),
    //       userName: '试试就逝世',
    //     },
    //   });
    // });
    // const createdImages = await prisma.imageIndex.create({
    //   data: {
    //     // imageUrl: imageData[0],
    //     // category: 'activity_tags',
    //     // tags: '焱落纱',
    //     momentPics: imageData,
    //     momentId: generateUniqueId(),
    //   },
    // });

    // console.log('成功替换图片路径的记录数量:', createdImages.length);
    return {};

    // 查询所有需要替换路径的图片记录
    // const images = await prisma.imageUserUpload.findMany({
    //   // where: {
    //   //   momentPics: {
    //   //     contains: '/home/ubuntu/code/server/static/', // 包含旧路径的图片
    //   //   },
    //   // },
    // });

    // 批量更新图片路径
    // const updatedImages = await Promise.all(
    //   images.map(async (image) => {
    //     const updatedImage = await prisma.imageUserUpload.updateMany({
    //       data: {
    //         momentPics: '/' + image.momentPics,
    //         // userHeadPic: '/' + image.userHeadPic,
    //         // userHeadPic: image.userHeadPic.replace(
    //         //   '/home/ubuntu/code/server/static/',
    //         //   ''
    //         // ),
    //       },
    //       where: {
    //         momentId: image.momentId,
    //       },
    //     });
    //     return updatedImage;
    //   })
    // );

    // console.log('成功替换图片路径的记录数量:', updatedImages.length);
    // return updatedImages;
  } catch (error) {
    console.error('替换图片路径时出错:', error);
    throw error;
  }
};
