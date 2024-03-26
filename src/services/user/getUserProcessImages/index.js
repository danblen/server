import { ENV } from '../../../config/index.js';
import prisma from '../../../db/prisma.js';

// 查询用户历史生成的作品图片
export default async (req, res) => {
  const { userId, requestStatus } = req.body;
  // 在userProcessImageData表中查找userId为userId的记录
  if (!userId) {
    return { message: 'no userId' };
  }
  // const user = await prisma.user.findUnique({
  //   where: {
  //     userId,
  //   },
  // });

  // try {
  //   await prisma.userProcessImageData.updateMany({
  //     where: {
  //       userId: user.openid,
  //     },
  //     data: {
  //       userId: user.userId,
  //       openid: user.openid,
  //     },
  //   });
  // } catch (error) {
  //   console.log(error);
  // }

  // 成功了的放到这个表里，默认状态是成功
  let finishedImages = await prisma.userProcessImageData.findMany({
    where: {
      userId,
      // requestStatus: 'finishing',
    },
  });
  finishedImages = finishedImages
    .filter((item) => item.outputImagePath)
    .map((item) => ({
      outputImagePath: ENV.URL_STATIC + item.outputImagePath,
      requestId: item.requestId,
    }));
  let pendingImages = await prisma.tasks.findMany({
    where: {
      userId,
      status: {
        in: ['pending', 'waiting'],
      },
    },
  });
  pendingImages = pendingImages.map((item) => ({
    requestId: item.requestId,
    status: item.status,
  }));
  return { data: { finishedImages, pendingImages } };
};
