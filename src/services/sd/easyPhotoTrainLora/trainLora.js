import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { DateTime } from 'luxon';
import {
  addGenImageInUserProcessImageData,
  deleteTaskInSDRunningTasks,
} from '../../common/processQueueSql.js';
import prisma from '../../../db/prisma.js';
import { addUserPoints } from '../../common/userPoints.js';

async function readImagesFromPath(userTrainImagesPath) {
  try {
    const encodedImages = [];
    // 遍历指定路径下的所有文件
    const files = fs.readdirSync(userTrainImagesPath);
    for (const file of files) {
      const imagePath = path.join(userTrainImagesPath, file);
      // 读取文件内容并添加到 encodedImages 数组中
      const imageData = fs.readFileSync(imagePath, 'base64');
      encodedImages.push(imageData);
    }
    return encodedImages;
  } catch (error) {
    console.error('Error reading images from path:', error.message);
    throw error;
  }
}

export async function trainProcess(
  userId,
  requestId,
  usePoint,
  userTrainDataPath
) {
  try {
    const encodedImages = await readImagesFromPath(userTrainDataPath);
    const currentTime = DateTime.now().toFormat('yyyyMMddHHmm');
    const loraName = `${userId}_${currentTime}`;

    const requestData = JSON.stringify({
      user_id: loraName,
      sd_model_checkpoint: 'Chilloutmix-Ni-pruned-fp16-fix.safetensors',
      resolution: 512,
      val_and_checkpointing_steps: 100,
      max_train_steps: 10,
      steps_per_photos: 100,
      train_batch_size: 1,
      gradient_accumulation_steps: 4,
      dataloader_num_workers: 16,
      learning_rate: 1e-4,
      rank: 64,
      network_alpha: 64,
      instance_images: encodedImages,
    });

    console.log('start post easyphoto_train_forward');
    const response = await axios.post(
      'https://u349479-b416-03e0f33d.westb.seetacloud.com:8443/easyphoto/easyphoto_train_forward',
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('response', response.data);
    if (response.data.message != 'The training has been completed.') {
      console.log('response', response);
      await addGenImageInUserProcessImageData(
        userId,
        requestId,
        usePoint,
        null,
        null,
        null,
        'train',
        response
      );
      await deleteTaskInSDRunningTasks(requestId);
      addUserPoints(userId, usePoint);

      await prisma.user.update({
        where: {
          userId,
        },
        data: {
          loraStatus: 'error',
        },
      });

      return false;
    }

    // Update user's loraName
    await prisma.user.update({
      where: {
        userId,
      },
      data: {
        loraName,
        loraStatus: 'done',
      },
    });

    await addGenImageInUserProcessImageData(
      userId,
      requestId,
      usePoint,
      null,
      null,
      null,
      'train',
      'finishing'
    );
    await deleteTaskInSDRunningTasks(requestId);
  } catch (error) {
    console.log('Error occurred during training:', error.message);
    addUserPoints(userId, usePoint);
    await addGenImageInUserProcessImageData(
      userId,
      requestId,
      usePoint,
      null,
      null,
      null,
      'train',
      error.message
    );
    await deleteTaskInSDRunningTasks(requestId);
    await prisma.user.update({
      where: {
        userId,
      },
      data: {
        loraStatus: 'error',
      },
    });
    return false;
  }
}
