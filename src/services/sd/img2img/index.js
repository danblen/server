import { format } from 'date-fns';
import { ENV, STATIC_DIR } from '../../../config/index.js';
import path from 'path';
import prisma from '../../../db/prisma.js';
import { saveBase64Image } from '../../../common/file.js';
import { decreaseUserPoints } from '../../common/userPoints.js';
import { addTaskInSDRunningTasks } from '../../common/processQueueSql.js';

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
    const now = Date.now();
    const date = format(new Date(), 'yyyy-MM-dd');
    // const mainImageDir = path.join(STATIC_DIR, '/userImages', userId, date);
    // const mainFile = `${now}main.png`;
    // saveBase64Image(sdParams.init_images[0], mainImageDir, mainFile);
    const roopImageDir = path.join(STATIC_DIR, '/userImages', userId, date);
    const roopFile = `${now}roop.png`;
    saveBase64Image(
      sdParams.alwayson_scripts?.roop.args[0],
      roopImageDir,
      roopFile
    );
    if (sdParams?.alwayson_scripts?.roop?.args) {
      sdParams.alwayson_scripts.roop.args[0] = '000';
    }
    const img2imgreqData = JSON.stringify(sdParams);
    if (
      // 将 req.body 转换为 JSON 字符串
      !addTaskInSDRunningTasks(
        userId,
        requestId,
        usePoint,
        sdParams.init_images[0],
        roopImageDir + '/' + roopFile,
        'img2img',
        null,
        null,
        img2imgreqData,
        null
      )
    ) {
      return { message: 'add task error' };
    }
    decreaseUserPoints(userId, usePoint);
    return { message: `img2img start successfully ` };

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
    //   addGenImageInUserProcessImageData(
    //     userId,
    //     requestId,
    //     usePoint,
    //     mainImageDir + '/' + mainFile,
    //     roopImageDir + '/' + roopFile,
    //     STATIC_DIR + relativePathDir + '/' + fileName
    //   );
    //   deleteTaskInSDRunningTasks(requestId);
    //   return {
    //     data: { imageUrl: ENV.URL_STATIC + relativePathDir + '/' + fileName },
    //   };
    // }

    // return { message: '任务超时，稍后在作品页查看' };
  } catch (error) {
    console.log('Error processing request:', error.message);
    return { message: 'An error occurred while processing the request' };
  }
};
