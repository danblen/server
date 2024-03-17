// pendingTaskProcess.js

import * as processQueue from './services/common/processQueueSql.js';

// import img2img from './services/sd/img2img/img2imgProcess.js';
// import txt2img from './services/sd/txt2img/txt2imgProcess.js';
import { trainProcess } from './services/sd/easyPhotoTrainLora/trainLora.js';
import { generatProcess } from './services/sd/easyPhotoSwapFace/generated.js';
import { img2imgProcess } from './services/sd/img2img/img2imgProcess.js';

let pendingTasksCount = 0; // 记录挂起任务的数量

// 处理 pending 任务的函数
export async function pendingTaskProcess() {
  while (true) {
    try {
      // 只有在没有挂起任务或挂起任务数量为0时才查询数据库获取挂起任务数量
      if (pendingTasksCount === 0) {
        pendingTasksCount = await processQueue.getPendingTasksCount();
        // console.log('pendingTasksCount ', pendingTasksCount);
      }

      // 如果有挂起任务，则获取最早的挂起任务
      if (pendingTasksCount > 0) {
        const pendingTask = await processQueue.getEarliestPendingTask();

        // 处理挂起任务
        if (
          pendingTask &&
          pendingTask.requestStatus === 'pending' &&
          typeof pendingTask.imageType === 'string'
        ) {
          if (pendingTask.imageType === 'train') {
            await trainProcess(
              pendingTask.userId,
              pendingTask.requestId,
              pendingTask.usePoint,
              pendingTask.userTrainDataPath
            );
          } else if (pendingTask.imageType === 'loraFace') {
            await generatProcess(
              pendingTask.userId,
              pendingTask.requestId,
              pendingTask.usePoint,
              pendingTask.mainImagePath,
              pendingTask.loraName
            );
          } else if (pendingTask.imageType === 'img2img') {
            await img2imgProcess(
              pendingTask.userId,
              pendingTask.requestId,
              pendingTask.usePoint,
              pendingTask.img2imgreqData,
              pendingTask.mainImagePath,
              pendingTask.roopImagePath
            );
          } else if (pendingTask.imageType === 'txt2img') {
          } else {
            console.error(
              'Error task type while processing pending tasks:',
              error
            );
          }
          await sleep(200);
        }

        pendingTasksCount--; // 处理完一个挂起任务后，减少挂起任务数量
      } else {
        // console.log('have not pending tasks:');
        await sleep(1000);
      }
    } catch (error) {
      console.error('Error occurred while processing pending tasks:', error);
      await sleep(1000);
    }
  }
}

// 模拟等待一段时间的函数
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 启动处理 pending 任务的函数
pendingTaskProcess();
