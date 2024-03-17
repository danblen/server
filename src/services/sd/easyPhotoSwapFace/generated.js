import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import { DateTime } from 'luxon';
import {
  addGenImageInUserProcessImageData,
  deleteTaskInSDRunningTasks,
} from '../../common/processQueueSql.js';
import prisma from '../../../db/prisma.js';
import { addUserPoints } from '../../common/userPoints.js';

// 辅助函数：检查是否为有效 URL
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function decodeImageFromBase64Jpeg(base64Image) {
  const imageBuffer = Buffer.from(base64Image, 'base64');
  return sharp(imageBuffer);
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
    'https://u349479-b416-03e0f33d.westb.seetacloud.com:8443/easyphoto/easyphoto_infer_forward',
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
      console.log('Number of Outputs:', outputs.length);
      // 获取当前时间
      const currentDateHMS = new Date();
      const hours = currentDateHMS.getHours().toString().padStart(2, '0');
      const minutes = currentDateHMS.getMinutes().toString().padStart(2, '0');
      const seconds = currentDateHMS.getSeconds().toString().padStart(2, '0');
      const currentTime = `${hours}${minutes}${seconds}`;

      // 获取当前日期
      const currentDateYM = new Date()
        .toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\//g, '-');

      // 构建保存路径
      const savePath = `/home/ubuntu/code/server/static/sd_make_images/${userId}/${currentDateYM}`;

      // 检查路径是否存在，如果不存在则递归创建
      if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
      }
      let outputFile = null;
      for (let i = 0; i < outputs.length; i++) {
        // 解码处理后的图像并保存
        const decodedImage = await decodeImageFromBase64Jpeg(outputs[i]);
        outputFile = `${savePath}/output${i}_${currentTime}.jpg`;
        await decodedImage.toFile(outputFile);
        const stats = fs.statSync(outputFile);
        console.log('Output image size:', stats.size, 'bytes');
        console.log('Output file path:', outputFile); // 输出完整的文件路径
        break; //只保存一张
      }

      return {
        message: message,
        status: 200,
        outputFilePaths: outputFile,
      };
    } else {
      console.log(`No outputs image`);
      return { message: message, status: 500 };
    }
  } catch (error) {
    console.error(`Error occurred while processing image ${savePath}:`, error);
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
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    return await processImage(base64Image, loraName, userId);
  } catch (error) {
    console.error(`Error occurred while processing image ${imageUrl}:`, error);
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
  try {
    let processRes = null;
    if (isValidUrl(imageUrls)) {
      // 处理远程图片
      processRes = await processImageUrl(imageUrls, loraName, userId);
      console.log('processImageUrl:', processRes);
    } else {
      console.log('images url does not exist:', imageUrls);
      throw new Error('File or directory does not exist'); // 抛出错误以便上层函数捕获
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
      await deleteTaskInSDRunningTasks(requestId);
      return false;
    }
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
    await deleteTaskInSDRunningTasks(requestId);
    return true;
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
    return false;
  }
}
