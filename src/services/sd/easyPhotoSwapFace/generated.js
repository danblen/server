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
async function forwardToGPU(encodedImage, loraName) {
  const requestData = {
    user_ids: loraName,
    sd_model_checkpoint: 'Chilloutmix-Ni-pruned-fp16-fix.safetensors',
    init_image: encodedImage,
    first_diffusion_steps: 50,
    first_denoising_strength: 0.45,
    second_diffusion_steps: 20,
    second_denoising_strength: 0.35,
    seed: 12345,
    crop_face_preprocess: true,
    before_face_fusion_ratio: 0.8,
    after_face_fusion_ratio: 0.8,
    apply_face_fusion_before: true,
    apply_face_fusion_after: true,
    color_shift_middle: true,
    color_shift_last: true,
    super_resolution: true,
    background_restore: false,
    tabs: 1,
  };

  const response = await axios.post(
    `${ENV.GPU_HOST}/easyphoto/easyphoto_infer_forward`,
    requestData
  );

  return response.data; // 返回处理结果
}

// 处理图片函数
async function processImage(encodedImage, loraName, userId) {
  try {
    // 向 GPU 发送请求处理图像
    const { message, outputs } = await forwardToGPU(encodedImage, loraName);
    console.log('Loop Message:', message);

    // 检查 message 中是否包含错误信息
    if (message && message.toLowerCase().includes('error')) {
      return { message: message, status: 500 };
    }

    // 处理处理结果
    if (outputs && outputs.length > 0) {
      console.log('Number of generated:', outputs.length);
      let outputFile = null;
      for (let i = 0; i < outputs.length; i++) {
        // 解码处理后的图像并保存
        const relativePathDir = path.join(
          '/userImages',
          userId,
          format(new Date(), 'yyyy-MM-dd')
        );
        const fileName = `${Date.now()}.png`;
        outputFile = await saveBase64Image(
          outputs[i],
          STATIC_DIR + relativePathDir,
          fileName
        );
        console.log('generated outputFile', outputFile);
        break; //只保存一张
      }

      return {
        message: message,
        status: 200,
        outputFilePaths: outputFile,
      };
    } else {
      console.log(`No outputs image`);
      return { message: message, status: 500, outputFilePaths: null };
    }
  } catch (error) {
    console.error(`Error occurred while processing image:`, error);
    throw error; // 抛出错误以便上层函数捕获
  }
}

// 处理本地图片
async function processImagePath(imagePath, loraName, userId) {
  try {
    // 读取本地文件数据
    const imageData = await fs.promises.readFile(imagePath);
    // 将获取的图片数据转换为 base64 字符串
    const base64Image = Buffer.from(imageData).toString('base64');
    return await processImage(base64Image, loraName, userId);
  } catch (error) {
    console.error(
      `Error occurred while processing image from path ${imagePath}:`,
      error.message
    );
    throw error; // 抛出错误以便上层函数捕获
  }
}

// 处理远程图片
async function processImageUrl(imageUrl, loraName, userId) {
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

export async function generatProcess(
  userId,
  requestId,
  usePoint,
  imageUrls,
  loraName
) {
  if (requestId != '-1') {
    await deleteTaskInSDRunningTasks(requestId);
  } else {
    requestId = generateUniqueId();
  }
  try {
    let processRes = null;
    if (isValidUrl(imageUrls)) {
      // 处理远程图片
      processRes = await processImageUrl(imageUrls, loraName, userId);
      console.log('processImageUrl:', processRes);
    } else if (fs.existsSync(imageUrls)) {
      // 处理本地文件路径
      processRes = await processImagePath(imageUrls, loraName, userId);
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
        'loraFace',
        processRes.message
      );
      return null;
    }

    processRes.outputFilePaths = processRes?.outputFilePaths?.replace(
      STATIC_DIR,
      ''
    );
    await addGenImageInUserProcessImageData(
      userId,
      requestId,
      usePoint,
      imageUrls,
      null,
      processRes.outputFilePaths,
      'loraFace',
      'finishing'
    );
    return processRes;
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
    return null;
  }
}
