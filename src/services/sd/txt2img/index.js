// import { format } from 'date-fns';
// import { ENV, STATIC_DIR } from '../../../config/index.js';
// import forwardToGPU from './forwardToGPU.js';
// import path from 'path';
// import fs from 'fs/promises';
import prisma from '../../../db/prisma.js';
import { decreaseUserPoints } from '../../common/userPoints.js';
import {
  addGenImageInUserProcessImageData,
  addTaskInSDRunningTasks,
  deleteTaskInSDRunningTasks,
} from '../../common/processQueueSql.js';

export default async (req) => {
  try {
    const { userId, requestId, usePoint = 1, sdParams } = req.body;
    if (!userId || !requestId) {
      return { message: 'no userId' };
    }
    const user = await prisma.user.findUnique({
      where: {
        userId,
      },
    });
    if (!user) {
      return { message: 'User not found' };
    }
    if (user.points < usePoint) {
      return { message: '积分不够了~' };
    }
    if (sdParams?.alwayson_scripts?.roop?.args) {
      const now = Date.now();
      const date = format(new Date(), 'yyyy-MM-dd');
      const roopImageDir = path.join(STATIC_DIR, '/userImages', userId, date);
      const roopFile = `${now}roop.png`;
      saveBase64Image(
        sdParams.alwayson_scripts?.roop.args[0],
        roopImageDir,
        roopFile
      );
      sdParams.alwayson_scripts.roop.args[0] = '000';
    }
    const txt2imgreqData = JSON.stringify(sdParams);
    if (
      !addTaskInSDRunningTasks(
        userId,
        requestId,
        usePoint,
        '',
        roopImageDir + '/' + roopFile,
        'txt2img',
        '',
        '',
        '',
        txt2imgreqData
      )
    ) {
      return { message: 'add task error' };
    }
    decreaseUserPoints(userId, usePoint);
    return { message: `txt2img start successfully ` };

    // const res = await forwardToGPU(sdParams);
    // if (res?.data) {
    //   const relativePathDir = path.join(
    //     '/sd_make_images',
    //     userId,
    //     format(new Date(), 'yyyy-MM-dd')
    //   );
    //   const fileName = `${Date.now()}.png`;
    //   saveBase64Image(
    //     res.data.images[0],
    //     STATIC_DIR + relativePathDir,
    //     fileName
    //   );
    //   return {
    //     data: { imageUrl: ENV.URL_STATIC + relativePathDir + '/' + fileName },
    //   };
    // }

    // return { message: '任务超时，稍后在作品页查看' };
  } catch (error) {
    console.error('Error processing request:', error);
    return { message: 'An error occurred while processing the request' };
  }
};
