import fs from 'fs/promises'; // 使用 promises 风格的 fs 模块
import path from 'path';
import prisma from '../../../db/prisma.js';
import forwardToGPU from './forwardToGPU.js';
import { projectRoot } from '../../../common/path.js';

// 检查并创建目录的函数
async function ensureDirectoryExists(directory) {
  try {
    await fs.access(directory); // 检查目录是否存在
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 如果目录不存在，则创建目录
      await fs.mkdir(directory, { recursive: true });
    }
  }
}
// 换脸接口
export default async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return;
  }
  const user = await prisma.user.findUnique({
    where: { userId },
  });
  if (user.points < 1) {
    return { error: 'no points' };
  }
  const gpuRes = await forwardToGPU(req.body);
  // 调用成功
  if (gpuRes?.data) {
    const requestId = gpuRes.data.request_id;
    // 保存图片到文件并获取文件路径
    // 图片目录
    let imagesDir = path.join(
      projectRoot,
      'sd_make_images',
      new Date().toISOString().slice(0, 10)
    );
    imagesDir = path.join(imagesDir, userId);
    await ensureDirectoryExists(imagesDir);
    const mainImagePath = await saveBase64Image(
      req.body.init_images[0],
      imagesDir
    );
    const roopImagePath = await saveBase64Image(
      req.body.alwayson_scripts.roop.args[0],
      imagesDir
    );
    // 保存图片路径到数据库
    updateUserImage(userId, requestId, mainImagePath, roopImagePath);
    // 积分需要减1
    updataUserInfo(userId);
    return {
      data: { requestId, status: 'pending', type: 'img2img' },
    };
  } else {
    // 调用失败直接返回data为null
    return { code: 'error', data: null };
  }
};

async function saveBase64Image(base64Data, imagesDir) {
  if (!base64Data) return null;
  try {
    const imageName = `${Date.now()}.png`;
    const imagePath = path.join(imagesDir, imageName);

    await fs.writeFile(
      imagePath,
      Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    );
    return imagePath;
  } catch (error) {
    console.error('Error saving base64 image:', error.message);
    return null;
  }
}
// 积分需要减1
async function updataUserInfo(userId) {
  // 需要使用await等待数据库操作，不然更新不成功
  await prisma.user.update({
    where: {
      userId,
    },
    data: {
      points: {
        // 使用 Prisma 提供的数学运算符对积分进行减一操作
        decrement: 1,
      },
    },
  });
}

async function updateUserImage(
  userId,
  requestId,
  mainImagePath,
  roopImagePath
) {
  try {
    // 新建一条换脸任务的数据，保存数据到数据库
    const userTask = await prisma.userProcessImageData.create({
      data: {
        userId: userId,
        imageType: 'img2img',
        requestId: requestId,
        requestStatus: 'pending',
        mainImagePath: mainImagePath || null,
        roopImagePath: roopImagePath || null,
      },
    });
  } catch (error) {
    console.error('Error updating user info in SQL:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}
