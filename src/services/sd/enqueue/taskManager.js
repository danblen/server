import { format } from 'date-fns';
import { saveBase64Image } from '../../../common/file.js';
import { STATIC_DIR } from '../../../config/index.js';
import prisma from '../../../db/prisma.js';
import { api } from './api.js';
import path from 'path';

// runWaitingTasks();
// updatePendingTasks();
// getDoneTaskResults();

export async function runWaitingTasks() {
  const tasks = await prisma.tasks.findMany({
    where: {
      status: 'waiting',
    },
    take: 100, // 限制获取的记录数为100
  });

  const promises = tasks.map(async (task) => {
    const { type, requestId, sdParams, taskType } = task;
    const params = JSON.parse(sdParams);
    let updatedTaskId = null; // 用于存储每个任务的 taskId
    if (taskType === 'img2img') {
      const res = await api['img2img'](params);
      updatedTaskId = res.data.task_id;
    } else if (taskType === 'txt2img') {
      const res = await api['txt2img'](params);
      updatedTaskId = res.data.task_id;
    }
    return [requestId, updatedTaskId]; // 返回更新后的 taskId
  });

  const ids = await Promise.all(promises);

  const updatePromises = ids.map(([requestId, taskId]) =>
    prisma.tasks.update({
      where: {
        requestId: requestId,
      },
      data: {
        taskId,
        status: 'pending',
      },
    })
  );

  await Promise.all(updatePromises);

  return {}; // 返回所有任务的更新后的 taskId
}

export default async function updatePendingTasks() {
  const tasks = await prisma.tasks.findMany({
    where: {
      status: 'pending',
    },
    take: 100, // 限制获取的记录数为100
  });

  const promises = tasks.map(async (task) => {
    const { type, requestId, taskId, taskType } = task;
    const res = await api['getTask'](taskId);
    if (res.data.data) {
      return { requestId, data: res.data.data, taskId }; // ; // 返回更新后的 taskId
    }
    return { requestId, data: {}, taskId };
  });

  const restasks = await Promise.all(promises);
  const taskIds = restasks.filter(({ data }) => data?.status === 'done'); // 过滤出已完成的任务

  const updatePromises = taskIds.map(({ requestId, data, taskId }) =>
    prisma.tasks.update({
      where: {
        requestId,
      },
      data: {
        data: data.result,
        status: 'done',
      },
    })
  );
  const updateData = await Promise.all(updatePromises);
  updateData;

  return {}; // 返回所有任务的更新后的 taskId
}
export async function getDoneTaskResults() {
  const tasks = await prisma.tasks.findMany({
    where: {
      status: 'done',
    },
    take: 100, // 限制获取的记录数为100
  });
  if (tasks.length === 0) {
    return {};
  }
  const promises = tasks.map(async (task) => {
    const { type, requestId, taskId, data, userId } = task;
    const res = await api['getTaskResults'](taskId);
    let image = res.data.data[0].image;
    let filePath = JSON.parse(data).images[0];
    filePath = filePath.replace('/root/autodl-tmp', '');
    await saveBase64Image(
      image,
      STATIC_DIR + path.dirname(filePath),
      path.basename(filePath)
    );
    return { type, requestId, filePath, taskId, userId }; // ; // 返回更新后的 taskId
  });
  const restasks = await Promise.all(promises);
  await prisma.userProcessImageData.createMany({
    data: restasks.map(({ type, requestId, filePath, taskId, userId }) => ({
      outputImagePath: filePath,
      userId,
      requestId,
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    })),
  });
  await prisma.tasks.deleteMany({
    where: {
      taskId: {
        in: restasks.map(({ taskId }) => taskId),
      },
    },
  });

  return {}; // 返回所有任务的更新后的 taskId
}
