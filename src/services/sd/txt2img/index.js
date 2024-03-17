import { format } from 'date-fns';
import { ENV, STATIC_DIR } from '../../../config/index.js';
import forwardToGPU from './forwardToGPU.js';
import path from 'path';
import fs from 'fs/promises';
import prisma from '../../../db/prisma.js';
import { decreaseUserPoints } from '../../common/userPoints.js';

export default async (req) => {
  try {
    const { userId, requestId, usePoint = 1, sdParams } = req.body;
    if (!userId) {
      return { message: 'no userId' };
    }
    const user = await prisma.user.findUnique({
      where: { userId },
    });
    if (user.points < usePoint) {
      return { message: '积分不够了~' };
    }
    decreaseUserPoints(userId, usePoint);

    const res = await forwardToGPU(sdParams);
    if (res?.data) {
      const relativePathDir = path.join(
        '/sd_make_images',
        userId,
        format(new Date(), 'yyyy-MM-dd')
      );
      const fileName = `${Date.now()}.png`;
      saveBase64Image(
        res.data.images[0],
        STATIC_DIR + relativePathDir,
        fileName
      );
      return {
        data: { imageUrl: ENV.URL_STATIC + relativePathDir + '/' + fileName },
      };
    }

    return { message: '任务超时，稍后在作品页查看' };
  } catch (error) {
    console.error('Error processing request:', error);
    return { message: 'An error occurred while processing the request' };
  }
};
async function saveBase64Image(base64Data, fullPathDir, fileName) {
  if (!base64Data) return null;
  try {
    await fs.mkdir(fullPathDir, { recursive: true });
    await fs.writeFile(
      fullPathDir + '/' + fileName,
      Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    );
    return `${fullPathDir}/${fileName}`; // 返回保存的文件路径
  } catch (error) {
    console.error('Error saving base64 image:', error.message);
    return null;
  }
}

async function addTaskInSDRunningTasks(
  userId,
  requestId,
  usePoint,
  mainImagePath,
  roopImagePath
) {
  try {
    // 新建一条换脸任务的数据，保存数据到数据库
    await prisma.sDRunningTasks.create({
      data: {
        userId: userId,
        imageType: 'img2img',
        requestId: requestId,
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        requestStatus: 'pending',
        mainImagePath: mainImagePath || null,
        roopImagePath: roopImagePath || null,
        usePoint: usePoint,
      },
    });
  } catch (error) {
    console.error('Error updating user info in SQL:', error.message);
  } finally {
  }
}
async function deleteTaskInSDRunningTasks(requestId) {
  try {
    // 新建一条换脸任务的数据，保存数据到数据库
    await prisma.sDRunningTasks.delete({
      where: {
        requestId,
      },
    });
  } catch (error) {
    console.error('Error updating user info in SQL:', error.message);
  } finally {
  }
}
async function addGenImageInUserProcessImageData(
  userId,
  requestId,
  usePoint,
  mainImagePath,
  roopImagePath,
  outputImagePath
) {
  try {
    // 新建一条换脸任务的数据，保存数据到数据库
    await prisma.userProcessImageData.create({
      data: {
        userId: userId,
        imageType: 'img2img',
        requestId: requestId,
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        requestStatus: 'pending',
        mainImagePath: mainImagePath,
        roopImagePath: roopImagePath,
        usePoint: usePoint,
        requestStatus: 'finishing',
        outputImagePath,
      },
    });
  } catch (error) {
    console.error('Error updating user info in SQL:', error.message);
  } finally {
  }
}
