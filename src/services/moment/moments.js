// moments.js

import prisma from '../../../db/prisma.js';

function generateUniqueMomentId() {
  // 使用时间戳作为基础
  let momentId = Date.now().toString(36);

  // 添加随机数以确保唯一性
  momentId += Math.random().toString(36).substr(2, 5);

  return momentId;
}
const fs = require('fs');
const path = require('path');

const uploadDirectory = '/home/ubuntu/code/server/uploads'; // 定义绝对路径

// 如果目录不存在，则创建目录
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}
// 发布朋友圈
async function publishMoment(req, res) {
  try {
    const { userId, tagName, momentPics, momentText, momentTitle } = req.body;

    if (
      !userId ||
      !momentPics ||
      !Array.isArray(momentPics) ||
      !tagName ||
      !momentTitle ||
      !momentText
    ) {
      throw new Error('Missing required parameters or image is not an array');
    }
    const momentId = generateUniqueMomentId();

    const imagePaths = []; // 用于保存图片路径的数组

    // 遍历上传的所有图片数据
    momentPics.forEach((momentPics, index) => {
      if (!momentPics) return;
      // 删除 base64 字符串中的前缀
      const base64Data = momentPics.replace(/^data:image\/\w+;base64,/, '');
      // 解码 base64 字符串为二进制数据
      const imageData = Buffer.from(base64Data, 'base64');
      // 生成文件路径，使用描述作为文件名
      const imagePath = path.join(
        uploadDirectory,
        `${momentTitle}-${index + 1}.png`
      );
      // 将图像数据写入文件
      fs.writeFileSync(imagePath, imageData);
      console.log(`Image ${index + 1} saved as:`, imagePath);
      // 将图片路径添加到数组中
      imagePaths.push(imagePath);
    });

    // 创建朋友圈记录
    const newMoment = await MomentsUser.create({
      data: {
        userId,
        momentId,
        tagName,
        imagePaths,
        momentText,
        momentTitle,
      },
    });

    res.status(201).json({ success: true, data: newMoment });
  } catch (error) {
    console.error('Error publishing moment:', error);
    res.status(500).json({ success: false, error: 'Failed to publish moment' });
  }
}

// 获取朋友圈列表
async function getMomentList(req, res) {
  try {
    // 查询数据库，获取朋友圈列表
    const momentList = await MomentsUser.findMany();

    res.status(200).json({ success: true, data: momentList });
  } catch (error) {
    console.error('Error getting moment list:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to get moment list' });
  }
}

// 点赞朋友圈
async function likeMoment(req, res) {
  try {
    const { momentId, userId } = req.body;

    // 查询朋友圈记录
    const moment = await MomentsUser.findUnique({
      where: {
        id: momentId,
      },
    });

    if (!moment) {
      return res
        .status(404)
        .json({ success: false, error: 'Moment not found' });
    }

    // 更新点赞信息
    await MomentsUser.update({
      where: {
        id: momentId,
      },
      data: {
        likesCount: moment.likesCount + 1,
        likesUser: [...moment.likesUser, userId],
      },
    });

    res
      .status(200)
      .json({ success: true, message: 'Moment liked successfully' });
  } catch (error) {
    console.error('Error liking moment:', error);
    res.status(500).json({ success: false, error: 'Failed to like moment' });
  }
}

// 其他接口函数...

module.exports = {
  publishMoment,
  getMomentList,
  likeMoment,
  // 其他接口函数...
};
