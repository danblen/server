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
import { ENV, STATIC_DIR } from '../../../config/index.js';
import { generatProcess } from '../easyPhotoSwapFace/generated.js';
import { downloadImageToBase64 } from '../../../common/downloadImage.js';

function getRandomImageByGender(filePath, gender) {
  if (!filePath || !gender) {
    console.error('文件路径和性别不能为空');
    return null;
  }

  // 根据性别选择文件夹
  const genderFolder = gender === 'male' ? 'male_images' : 'female_images';

  // 构建完整的路径
  const fullPath = `${filePath}/${genderFolder}`;

  // 读取文件夹中的所有文件
  const files = fs.readdirSync(fullPath);

  // 如果文件夹为空，返回空
  if (files.length === 0) {
    console.error('文件夹中没有图片');
    return null;
  }

  // 从文件数组中随机选择一个索引
  const randomIndex = Math.floor(Math.random() * files.length);

  // 返回随机选择的图片路径
  return `${fullPath}/${files[randomIndex]}`;
}

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
    // const encodedImages = await readImagesFromPath(userTrainDataPath);
    let paths = JSON.parse(userTrainDataPath);
    const encodedImages = await Promise.all(
      paths.map((item) => downloadImageToBase64(ENV.URL_STATIC + item))
    );
    const currentTime = DateTime.now().toFormat('yyyyMMddHHmm');
    const loraName = `${userId}_${currentTime}`;

    const requestData = JSON.stringify({
      user_id: loraName,
      sd_model_checkpoint: 'Chilloutmix-Ni-pruned-fp16-fix.safetensors',
      resolution: 512,
      val_and_checkpointing_steps: 100,
      max_train_steps: 500,
      steps_per_photos: 200,
      train_batch_size: 8,
      gradient_accumulation_steps: 1,
      dataloader_num_workers: 16,
      learning_rate: 1e-4,
      rank: 64,
      network_alpha: 64,
      instance_images: encodedImages,
    });

    const response = await axios.post(
      'https://u349479-89bd-0be97fcd.westb.seetacloud.com:8443/easyphoto/easyphoto_train_forward',
      // `${ENV.GPU_HOST}/easyphoto/easyphoto_train_forward`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        // timeout: 1800000, // 设置超时时间为30分钟
      }
    );
    await deleteTaskInSDRunningTasks(requestId);

    // console.log('response', response.data);
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

    const userData = await prisma.User.findUnique({
      where: {
        userId,
      },
    });
    const genderFilePath = getRandomImageByGender(
      STATIC_DIR + '/genderLoraPic',
      userData.userGender
    );
    console.log('genderFilePath', genderFilePath);
    const processRes = await generatProcess(
      userId,
      '-1',
      0,
      genderFilePath,
      loraName
    );
    if (processRes) {
      console.log('processRes.outputFilePaths', processRes.outputFilePaths);
      // Update user's loraName
      await prisma.user.update({
        where: {
          userId,
        },
        data: {
          loraName,
          loraStatus: 'done',
          loraPic: processRes.outputFilePaths,
        },
      });
    } else {
      await prisma.user.update({
        where: {
          userId,
        },
        data: {
          loraName: '',
          loraStatus: 'error',
          loraPic: '',
        },
      });
    }

    // await addGenImageInUserProcessImageData(
    //   userId,
    //   requestId,
    //   usePoint,
    //   null,
    //   null,
    //   null,
    //   'train',
    //   'finishing'
    // );
  } catch (error) {
    console.log('Error occurred during training:', error);
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
