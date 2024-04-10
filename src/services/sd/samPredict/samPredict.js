import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { format } from 'date-fns';
import { DateTime } from 'luxon';
import {
  addGenImageInUserProcessImageData,
  deleteTaskInSDRunningTasks,
} from '../../common/processQueueSql.js';
import prisma from '../../../db/prisma.js';
import { ENV, STATIC_DIR } from '../../../config/index.js';
import { addUserPoints } from '../../common/userPoints.js';
import { saveBase64Image } from '../../../common/file.js';
import { inpaitParam } from './inpaitParam.js';
import { processSDRequest } from '../img2img/img2imgProcess.js';
import { error } from 'console';

// 辅助函数：检查是否为有效 URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export function generateUniqueId() {
  const timestamp = new Date().getTime(); // 获取当前时间戳
  const random = Math.floor(Math.random() * 10000); // 生成0到9999之间的随机数
  const uniqueId = timestamp.toString() + random.toString(); // 将时间戳和随机数拼接成唯一ID
  return uniqueId;
}

// 发送图像数据到 GPU 进行处理
async function forwardToGPU(encodedImage) {
  const requestData = {
    sam_model_name: 'sam_vit_l_0b3195.pth', // 蒙版模型名称
    input_image: encodedImage, // 图像base64
    // sam_positive_points: [
    //     [317.7521, 174.7542],
    //     [304.25, 174.75],
    //     [295.25, 152.25],
    //     [292.25, 174.75],
    //     [284.75, 168.75],
    // ],                                     // 选中坐标点
    sam_negative_points: [], // 反选中坐标点
    dino_enabled: true, // 开启文字识别 例如一只猫在草坪上，想要得到猫的蒙版 可以使用 cat 会自动识别物品
    dino_text_prompt: 'face', // 文字（要英语）例如 cat
    dino_model_name: 'GroundingDINO_SwinT_OGC (694MB)', // 文字识别模型
  };
  console.log('1231', ENV.GPU_HOST);
  const response = await axios.post(
    'https://u349479-89bd-0be97fcd.westb.seetacloud.com:8443/sam/sam-predict',
    // `${ENV.GPU_HOST}/easyphoto/easyphoto_infer_forward`,
    requestData
  );

  return response.data; // 返回处理结果
}

// 处理图片函数
async function processImage(encodedImage, userId) {
  try {
    // 向 GPU 发送请求处理图像
    const { msg, blended_images, masks, masked_images } = await forwardToGPU(
      encodedImage
    );
    console.log('Message:', msg);

    // 检查 msg 中是否包含错误信息
    if (msg && msg.toLowerCase().includes('error')) {
      return { message: msg, status: 500 };
    }

    // 处理处理结果
    if (blended_images && masks && masked_images) {
      // console.log('Number of blended_images:', blended_images.length);
      // console.log('Number of masks:', masks.length);
      // console.log('Number of masked_images:', masked_images.length);

      // 保存 blended_images
      // let blended_outputFile = [];
      // for (let i = 0; i < blended_images.length; i++) {
      //   // 解码处理后的图像并保存
      //   const relativePathDir = path.join(
      //     '/userImages',
      //     userId,
      //     format(new Date(), 'yyyy-MM-dd')
      //   );
      //   const fileName = `${Date.now()}_blended.png`;
      //   blended_outputFile[i] = await saveBase64Image(
      //     blended_images[i],
      //     STATIC_DIR + relativePathDir,
      //     fileName
      //   );
      //   console.log('blended outputFile', blended_outputFile);
      // }

      // 保存 masks
      let mask_outputFile;
      for (let i = 0; i < masks.length; i++) {
        // 解码处理后的图像并保存
        const relativePathDir = path.join(
          '/userImages',
          userId,
          format(new Date(), 'yyyy-MM-dd')
        );
        const fileName = `${Date.now()}_mask.png`;
        mask_outputFile = await saveBase64Image(
          masks[i],
          STATIC_DIR + relativePathDir,
          fileName
        );
        break;
      }
      console.log('blended outputFile', mask_outputFile);

      // 保存 masked_images
      // let masked_images_outputFile = [];
      // for (let i = 0; i < masked_images.length; i++) {
      //   // 解码处理后的图像并保存
      //   const relativePathDir = path.join(
      //     '/userImages',
      //     userId,
      //     format(new Date(), 'yyyy-MM-dd')
      //   );
      //   const fileName = `${Date.now()}_mask_images.png`;
      //   masked_images_outputFile[i] = await saveBase64Image(
      //     masked_images[i],
      //     STATIC_DIR + relativePathDir,
      //     fileName
      //   );
      //   console.log('blended outputFile', masked_images_outputFile);
      // }

      console.log('mask_outputFile:', mask_outputFile);
      mask_outputFile = mask_outputFile.replace(STATIC_DIR, '');
      inpaitParam.init_images[0] = encodedImage;
      inpaitParam.mask = masks[0];
      const resImg2Img = await axios.post(
        `https://u349479-89bd-0be97fcd.westb.seetacloud.com:8443/sdapi/v1/img2img`,
        inpaitParam
      );

      if (resImg2Img?.data) {
        const relativePathDir = path.join(
          '/userImages',
          userId,
          format(new Date(), 'yyyy-MM-dd')
        );
        const fileName = `${Date.now()}.png`;
        const saveUrl = await saveBase64Image(
          resImg2Img.data.images[0],
          STATIC_DIR + relativePathDir,
          fileName
        );
        console.log('outfile :', saveUrl);
      } else {
        throw error;
      }

      return {
        message: msg,
        status: 200,
        tempFilePaths: mask_outputFile,
        outputFilePaths: saveUrl,
        // {
        // blended_images: blended_outputFile,
        // masks: mask_outputFile,
        // masked_images: masked_images_outputFile,
        // },
      };
    } else {
      console.log(`No outputs image`);
      return { message: msg, status: 500, outputFilePaths: null };
    }
  } catch (error) {
    console.error(`Error occurred while processing image:`, error);
    throw error; // 抛出错误以便上层函数捕获
  }
}

// 处理本地图片
async function processImagePath(imagePath, userId) {
  try {
    // 读取本地文件数据
    const imageData = await fs.promises.readFile(imagePath);
    // 将获取的图片数据转换为 base64 字符串
    const base64Image = Buffer.from(imageData).toString('base64');
    return await processImage(base64Image, userId);
  } catch (error) {
    console.error(
      `Error occurred while processing image from path ${imagePath}:`,
      error.message
    );
    throw error; // 抛出错误以便上层函数捕获
  }
}

// 处理远程图片
async function processImageUrl(imageUrl, userId) {
  try {
    // 发送 GET 请求获取远程图片数据
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    // 将获取的图片数据转换为 base64 字符串
    const base64Image = Buffer.from(response.data).toString('base64');
    return await processImage(base64Image, loraName, userId);
  } catch (error) {
    console.error(
      `Error occurred while processing image ${imageUrl}:`,
      error.message
    );
    throw error; // 抛出错误以便上层函数捕获
  }
}

export async function samPredict(userId, requestId, usePoint, imageUrls) {
  if (requestId != '-1') {
    await deleteTaskInSDRunningTasks(requestId);
  } else {
    requestId = generateUniqueId();
  }
  try {
    let processRes = null;
    if (isValidUrl(imageUrls)) {
      // 处理远程图片
      processRes = await processImageUrl(imageUrls, userId);
      console.log('processImageUrl:', processRes);
    } else if (fs.existsSync(imageUrls)) {
      // 处理本地文件路径
      processRes = await processImagePath(imageUrls, userId);
      console.log('processImagePath:', processRes);
    } else {
      console.log('Image URL or path does not exist:', imageUrls);
      throw new Error('File or URL does not exist');
    }
    if (processRes.status != 200) {
      addUserPoints(userId, usePoint);
      await addGenImageInUserProcessImageData(
        userId,
        requestId,
        usePoint,
        null,
        null,
        null,
        'SamPre',
        processRes.message,
        null
      );
      return null;
    }
    await addGenImageInUserProcessImageData(
      userId,
      requestId,
      usePoint,
      imageUrls,
      null,
      processRes.outputFilePaths,
      'SamPre',
      'finishing',
      processRes.tempImagePath
    );
    return processRes;
  } catch (error) {
    console.log('Error occurred during SamPre:', error.message);
    addUserPoints(userId, usePoint);
    await addGenImageInUserProcessImageData(
      userId,
      requestId,
      usePoint,
      null,
      null,
      null,
      'SamPre',
      error.message,
      null
    );
    return null;
  }
}
