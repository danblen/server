import axios from 'axios';
import { ENV } from '../../../config/index.js';
import { api } from './api.js';
import prisma from '../../../db/prisma.js';
import { format } from 'date-fns';
import taskManager from './taskManager.js';

export default async (req) => {
  const { userId, usePoint = 1, taskType, requestId = '', sdParams } = req.body;
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

  addTaskInTasks({
    userId,
    requestId,
    usePoint,
    taskType,
    status: 'waiting',
    sdParams,
  });

  return { message: '任务创建成功' };
};
export async function addTaskInTasks({
  userId,
  requestId,
  usePoint,
  taskType,
  sdParams = '',
  status = 'waiting',
}) {
  try {
    // 新建一条换脸任务的数据，保存数据到数据库
    await prisma.tasks.create({
      data: {
        userId,
        taskType,
        requestId,
        status,
        sdParams: JSON.stringify(sdParams),
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        usePoint,
      },
    });
    return true;
  } catch (error) {
    console.error('Error create sDRunningTasks info in SQL:', error.message);
    return false;
  } finally {
  }
}
