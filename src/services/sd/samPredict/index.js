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
    // if (sdParams?.init_images) {
    const mainImageDir = path.join(STATIC_DIR, '/userImages', userId, date);
    const mainFile = `${now}main.png`;
    const path123 = await saveBase64Image(
      sdParams.init_images[0],
      mainImageDir,
      mainFile
    );
    console.log('12312312312', path123);
    sdParams.init_images[0] = path123;
    // }
    // const mainImageDir = path.join(STATIC_DIR, '/userImages', userId, date);
    // const mainFile = `${now}main.png`;
    // saveBase64Image(sdParams.init_images[0], mainImageDir, mainFile);
    let roopImageDir;
    let roopFile;
    if (sdParams?.alwayson_scripts?.roop?.args) {
      roopImageDir = path.join(STATIC_DIR, '/userImages', userId, date);
      roopFile = `${now}roop.png`;
      await saveBase64Image(
        sdParams.alwayson_scripts?.roop.args[0],
        roopImageDir,
        roopFile
      );
      sdParams.alwayson_scripts.roop.args[0] = '000';
    }
    const samPrereqData = JSON.stringify(sdParams);
    if (
      // 将 req.body 转换为 JSON 字符串
      !addTaskInSDRunningTasks(
        userId,
        requestId,
        usePoint,
        sdParams.init_images[0],
        roopImageDir + '/' + roopFile,
        'SamPre',
        null,
        null,
        samPrereqData,
        null
      )
    ) {
      return { message: 'add task error' };
    }
    decreaseUserPoints(userId, usePoint);
    return { message: `SamPre start successfully ` };
  } catch (error) {
    console.log('Error processing request:', error.message);
    return { message: 'An error occurred while processing the request' };
  }
};
