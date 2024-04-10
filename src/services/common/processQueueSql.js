import { format } from 'date-fns';
import prisma from '../../db/prisma.js';

export async function addTaskInSDRunningTasks(
  userId,
  requestId,
  usePoint,
  mainImagePath = '',
  roopImagePath = '',
  processType,
  userTrainDataPath,
  loraName,
  img2imgreqData = '',
  txt2imgreqData = ''
) {
  try {
    console.log('create sDRunningTasks requestId:', requestId);
    // 新建一条换脸任务的数据，保存数据到数据库
    const pendingTask = await prisma.sDRunningTasks.create({
      data: {
        userId: userId,
        imageType: processType,
        requestId: requestId,
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        requestStatus: 'pending',
        mainImagePath: mainImagePath,
        roopImagePath: roopImagePath,
        usePoint: usePoint,
        userTrainDataPath: userTrainDataPath,
        loraName: loraName,
        img2imgreqData: img2imgreqData,
        txt2imgreqData: txt2imgreqData,
      },
    });
    return pendingTask;
  } catch (error) {
    console.error('Error create sDRunningTasks info in SQL:', error);
    return null;
  } finally {
  }
}
export async function deleteTaskInSDRunningTasks(requestId) {
  try {
    console.log('delete sDRunningTasks requestId:', requestId);
    // 新建一条换脸任务的数据，保存数据到数据库
    await prisma.sDRunningTasks.delete({
      where: {
        requestId,
      },
    });
  } catch (error) {
    console.error('Error delete sDRunningTasks info in SQL:', error);
  } finally {
  }
}
export async function addGenImageInUserProcessImageData(
  userId,
  requestId,
  usePoint,
  mainImagePath,
  roopImagePath,
  outputImagePath,
  processType,
  requestStatus,
  tempImagePath
) {
  try {
    console.log('add userProcessImageData requestId:', requestId);
    // 新建一条换脸任务的数据，保存数据到数据库
    await prisma.userProcessImageData.create({
      data: {
        userId: userId,
        imageType: processType,
        requestId: requestId,
        createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        requestStatus: 'pending',
        mainImagePath: mainImagePath,
        roopImagePath: roopImagePath,
        usePoint: usePoint,
        requestStatus: requestStatus,
        outputImagePath,
        tempImagePath: tempImagePath,
      },
    });
  } catch (error) {
    console.error(
      'Error create userProcessImageData info in SQL:',
      requestId,
      error
    );
  } finally {
  }
}

export async function getEarliestPendingTask() {
  try {
    // 查询数据库，按照创建时间的顺序获取最早创建的 pending 任务
    const earliestTask = await prisma.sDRunningTasks.findFirst({
      where: {
        requestStatus: 'pending',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return earliestTask;
  } catch (error) {
    console.error('Error getting earliest pending task:', error);
    throw error;
  }
}

export async function getPendingTasksCount() {
  try {
    // 查询数据库，获取挂起任务的数量
    const pendingTasksCount = await prisma.sDRunningTasks.count({
      where: {
        requestStatus: 'pending',
      },
    });

    return pendingTasksCount;
  } catch (error) {
    console.error('Error getting pending tasks count:', error);
    throw error;
  }
}
