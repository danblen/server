import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';
import prisma from '../../../db/prisma.js';
import { decreaseUserPoints } from '../../common/userPoints.js';
import { addTaskInSDRunningTasks } from '../../common/processQueueSql.js';

export default async (req, res) => {
  try {
    const {
      userId,
      requestId,
      usePoint = 1,
      sdParams: { imageUrl },
    } = req.body;
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
    if (!user.loraName || !user.loraName.startsWith(userId)) {
      return { message: 'User loraName not found' };
    }

    if (
      !addTaskInSDRunningTasks(
        userId,
        requestId,
        usePoint,
        imageUrl[0],
        null,
        'loraFace',
        null,
        user.loraName
      )
    ) {
      return { message: 'add task error' };
    }
    decreaseUserPoints(userId, usePoint);
    return { message: `Lora generated start successfully ` };
  } catch (error) {
    console.log('Error occurred:', error.message);
    return { message: 'add task error' };
  }
};
