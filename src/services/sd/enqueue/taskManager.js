import axios from 'axios';
import { format } from 'date-fns';
import path from 'path';
import { ENV } from '../../../config/index.js';
import prisma from '../../../db/prisma.js';
import { saveImageToServer } from '../../common/saveImageToServerApi.js';
import { api } from './api.js';
import { downloadImageToBase64 } from '../../../common/downloadImage.js';

const interval = 1000;
let loopCount = 0;
run();
async function run() {
  try {
    const tasksCount = await prisma.tasks.count();
    if (tasksCount === 0) {
      setTimeout(run, 5000);
      return;
    }

    // const res = await axios.get(ENV.GPU_HOST);
    // const gpuReady = res?.status === 200;
    // if (!gpuReady) {
    //   return;
    // }
    loopCount++;
    console.log(`开始下一轮:loopCount =${loopCount}, tasksCount=${tasksCount}`);
    await runWaitingTasks();
    await updatePendingTasks();
    await getDoneTaskResults();
    console.log('一轮执行结束');
  } catch (error) {
    console.error('An error occurred:', error);
  }
  setTimeout(run, interval);
}
async function runWaitingTasks() {
  const tasks = await prisma.tasks.findMany({
    where: {
      status: 'waiting',
    },
    // take: 3,
  });
  if (tasks.length === 0) {
    await prisma.$disconnect();
    return {};
  }
  // for (const task of tasks) {
  await Promise.all(
    tasks.map(async (task) => {
      try {
        const { type, requestId, sdParams, taskType } = task;
        let params;
        try {
          params = JSON.parse(sdParams);
          if (typeof params === 'string') {
            params = JSON.parse(params);
          }
        } catch (error) {
          // continue;
          return;
        }

        let taskId = '';
        if (taskType === 'img2img') {
          const res = await api['img2img'](params);
          params.alwayson_scripts.roop.args[0] = await downloadImageToBase64(
            params.alwayson_scripts.roop.args[0]
          );
          taskId = res?.data?.task_id;
        } else if (taskType === 'txt2img') {
          const res = await api['txt2img'](params);
          taskId = res?.data?.task_id;
        }

        if (taskId) {
          await prisma.tasks.update({
            where: { requestId: requestId },
            data: {
              taskId,
              status: 'pending',
              // startTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            },
          });
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    })
  );
  // }
  await prisma.$disconnect();
}

export default async function updatePendingTasks() {
  const tasks = await prisma.tasks.findMany({
    where: {
      status: 'pending',
    },
  });

  if (tasks.length === 0) {
    await prisma.$disconnect();
    return {};
  }

  // 并行处理所有的任务
  await Promise.all(
    tasks.map(async (task) => {
      const { requestId, taskId } = task;
      try {
        const res = await api['getTask'](taskId);

        if (res?.data?.data?.status === 'done') {
          return prisma.tasks.update({
            where: { requestId },
            data: { data: res.data.data.result, status: 'done' },
          });
        } else if (res?.data?.data?.status === 'failed') {
          return prisma.tasks.update({
            where: { requestId },
            data: { status: 'failed' },
          });
        } else if (res?.data?.data?.status === 'pending') {
          // return prisma.tasks.update({
          //   where: { requestId },
          //   data: {  startTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss')},
          // });
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    })
  );

  await prisma.$disconnect();
  return {};
}

export async function getDoneTaskResults() {
  const tasks = await prisma.tasks.findMany({
    where: {
      status: 'done',
    },
    // take: 100, // 限制获取的记录数为100
  });
  if (tasks.length === 0) {
    await prisma.$disconnect();
    return {};
  }
  // for (const task of tasks) {
  await Promise.all(
    tasks.map(async (task) => {
      const { type, requestId, taskId, data, userId, usePoint } = task;
      let res;
      try {
        res = await api['getTaskResults'](taskId);
      } catch (error) {
        console.error('Error occurred while fetching task results:', error);
        return;
      }
      if (!res?.data?.data?.length) {
        await prisma.tasks.update({
          where: { requestId },
          data: { status: 'waiting' },
        });
        return;
        // continue;
      }

      let image, filePath;
      try {
        filePath = JSON.parse(data).images[0];
        image = res.data.data[0].image;
      } catch (error) {}

      if (filePath && image) {
        filePath = filePath.replace('/root/autodl-tmp', '');
        await saveImageToServer({
          imageBase64: image,
          dir: path.dirname(filePath),
          filename: path.basename(filePath),
        });
      }

      try {
        await prisma.userProcessImageData.upsert({
          where: {
            requestId,
          },
          update: {
            outputImagePath: filePath,
          },
          create: {
            outputImagePath: filePath,
            imageType: 'img2img',
            userId,
            requestId,
            requestStatus: 'finishing',
            createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            usePoint,
          },
        });

        await prisma.tasks.delete({
          where: {
            requestId,
          },
        });
      } catch (error) {
        console.log(error);
      }
    })
  );
  // }
  await prisma.$disconnect();
  return {};
}
