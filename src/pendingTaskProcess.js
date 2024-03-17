// pendingTaskProcess.js

import * as processQueue from './services/common/processQueueSql.js';

// import img2img from './services/sd/img2img/img2imgProcess.js';
// import txt2img from './services/sd/txt2img/txt2imgProcess.js';
import { trainProcess } from './services/sd/easyPhotoTrainLora/trainLora.js';
import { generatProcess } from './services/sd/easyPhotoSwapFace/generated.js';

// 处理 pending 任务的函数
export async function pendingTaskProcess() {
  while (true) {
    try {
      // 获取数据库连接
      const pendingTask = await processQueue.getEarliestPendingTask(); // 假设这是获取数据库连接的函数

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
          console.log('task ', pendingTask);
          await generatProcess(
            pendingTask.userId,
            pendingTask.requestId,
            pendingTask.usePoint,
            pendingTask.mainImagePath,
            pendingTask.loraName
          );
        } else if (pendingTask.imageType === 'img2img') {
        } else if (pendingTask.imageType === 'img2img') {
        } else {
          console.error(
            'Error task type while processing pending tasks:',
            error
          );
        }
        await sleep(5000);
      } else {
        console.log('have not pending tasks:');
        await sleep(5000);
      }
    } catch (error) {
      console.error('Error occurred while processing pending tasks:', error);
      await sleep(5000);
    }
  }
}

// 模拟等待一段时间的函数
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 启动处理 pending 任务的函数
pendingTaskProcess();
