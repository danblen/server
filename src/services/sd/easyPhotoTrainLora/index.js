import path from 'path';
import fs from 'fs';
import prisma from '../../../db/prisma.js';
import { saveBase64Image } from '../../../common/file.js';
import { decreaseUserPoints } from '../../common/userPoints.js';
import { addTaskInSDRunningTasks } from '../../common/processQueueSql.js';

export default async (req, res) => {
  const { userId, requestId, usePoint = 1, userTrainImages } = req.body;
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

  try {
    const userTrainDataPath = path.join(
      '/home/ubuntu/code/server/static/userTrainImage',
      userId
    );
    if (!fs.existsSync(userTrainDataPath)) {
      fs.mkdirSync(userTrainDataPath, { recursive: true });
    }

    for (let i = 0; i < userTrainImages.length; i++) {
      if (
        (await saveBase64Image(
          userTrainImages[i],
          userTrainDataPath,
          `image_${i + 1}.jpg`
        )) === null
      ) {
        return { message: 'save user images error' };
      }
    }

    if (
      !addTaskInSDRunningTasks(
        userId,
        requestId,
        usePoint,
        null,
        null,
        'train',
        userTrainDataPath,
        null
      )
    ) {
      return { message: 'add task error' };
    }
    decreaseUserPoints(userId, usePoint);

    return { message: `Lora train start successfully ` };
  } catch (error) {
    console.error('Error occurred:', error);
    return { message: 'add task or save images error' };
  }
};
