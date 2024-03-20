import axios from 'axios';
import { ENV, STATIC_DIR } from '../../../config/index.js';
import {
  addGenImageInUserProcessImageData,
  deleteTaskInSDRunningTasks,
} from '../../common/processQueueSql.js';
import prisma from '../../../db/prisma.js';
import { addUserPoints } from '../../common/userPoints.js';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { saveBase64Image } from '../../../common/file.js';

// 调用sd接口，查询换脸结果
export async function img2imgProcess(
  userId,
  requestId,
  usePoint,
  img2imgreqData,
  mainImageDir,
  roopImageDir
) {
  try {
    const imageData = fs.readFileSync(roopImageDir, 'base64');
    if (img2imgreqData?.alwayson_scripts?.roop?.args) {
      img2imgreqData.alwayson_scripts.roop.args[0] = imageData;
      console.log(img2imgreqData.alwayson_scripts.roop.args[0].slice(0, 20));
    }

    const sdParams = JSON.parse(img2imgreqData);
    if (sdParams?.alwayson_scripts?.roop?.args) {
      sdParams.alwayson_scripts.roop.args[0] = imageData;
    }
    let res = await axios.post(`${ENV.GPU_HOST}/sdapi/v1/img2img`, sdParams);
    console.log('out:', res.data);
    if (res?.data) {
      const relativePathDir = path.join(
        '/sd_make_images',
        userId,
        format(new Date(), 'yyyy-MM-dd')
      );
      const fileName = `${Date.now()}.png`;
      const saveUrl = await saveBase64Image(
        res.data.images[0],
        STATIC_DIR + relativePathDir,
        fileName
      );
      console.log(saveUrl);
      await addGenImageInUserProcessImageData(
        userId,
        requestId,
        usePoint,
        mainImageDir,
        roopImageDir,
        STATIC_DIR + relativePathDir + '/' + fileName,
        'img2img',
        'finishing'
      );
      await deleteTaskInSDRunningTasks(requestId);
      return {
        data: { imageUrl: ENV.URL_STATIC + relativePathDir + '/' + fileName },
      };
    }

    console.log('Error occurred during img2img:', error.message);
    addUserPoints(userId, usePoint);
    await addGenImageInUserProcessImageData(
      userId,
      requestId,
      usePoint,
      null,
      null,
      null,
      'img2img',
      error.message
    );
    await deleteTaskInSDRunningTasks(requestId);
    return false;
  } catch (error) {
    console.log('Error occurred during img2img:', error.message);
    addUserPoints(userId, usePoint);
    await addGenImageInUserProcessImageData(
      userId,
      requestId,
      usePoint,
      null,
      null,
      null,
      'img2img',
      error.message
    );
    await deleteTaskInSDRunningTasks(requestId);
    return false;
  }
}
