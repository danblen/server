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

// 辅助函数：检查是否为有效 URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export async function processSDRequest(
  img2imgreqData,
  mainImageDir,
  roopImageDir
) {
  try {
    if (img2imgreqData?.alwayson_scripts?.roop?.args) {
      img2imgreqData.alwayson_scripts.roop.args[0] = imageData;
      console.log(img2imgreqData.alwayson_scripts.roop.args[0].slice(0, 20));
    }

    if (mainImageDir && !isValidUrl(mainImageDir)) {
      const imageData = fs.readFileSync(mainImageDir, 'base64');
      img2imgreqData.init_images[0] = imageData;
    }
    if (img2imgreqData?.alwayson_scripts?.roop?.args) {
      const imageData = fs.readFileSync(roopImageDir, 'base64');
      img2imgreqData.alwayson_scripts.roop.args[0] = imageData;
    }

    console.log('start post');
    let res = await axios.post(
      `https://u349479-89bd-0be97fcd.westb.seetacloud.com:8443/sdapi/v1/img2img`,
      img2imgreqData
    );

    return res;
  } catch (error) {
    console.log('Error occurred during processing:', error);
    throw error;
  }
}

export async function img2imgProcess(
  userId,
  requestId,
  usePoint,
  img2imgreqData,
  mainImageDir,
  roopImageDir
) {
  console.log('start img2imgProcess');
  await deleteTaskInSDRunningTasks(requestId);
  try {
    const sdParams = JSON.parse(img2imgreqData);
    let res = await processSDRequest(sdParams, mainImageDir, roopImageDir);

    if (res?.data) {
      const relativePathDir = path.join(
        '/userImages',
        userId,
        format(new Date(), 'yyyy-MM-dd')
      );
      const fileName = `${Date.now()}.png`;
      const saveUrl = await saveBase64Image(
        res.data.images[0],
        STATIC_DIR + relativePathDir,
        fileName
      );
      console.log('outfile :', saveUrl);
      await addGenImageInUserProcessImageData(
        userId,
        requestId,
        usePoint,
        mainImageDir,
        roopImageDir,
        saveUrl.replace(STATIC_DIR, ''),
        'img2img',
        'finishing'
      );
      return {
        data: { imageUrl: ENV.URL_STATIC + relativePathDir + '/' + fileName },
      };
    }

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
    return false;
  } catch (error) {
    console.log('Error occurred during img2img:', error);
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
    return false;
  }
}
