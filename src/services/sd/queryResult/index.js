import prisma from '../../../db/prisma.js';
import forwardToGPU from './forwardToGPU.js';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';
import { projectRoot } from '../../../common/path.js';

// 积分需要减1
async function updataUserInfo(userId, requestId) {
  const processInfo = await prisma.userProcessImageData.findUnique({
    where: { requestId },
  });
  console.log('use', processInfo.usePoint);
  // 需要使用await等待数据库操作，不然更新不成功
  await prisma.user.update({
    where: {
      userId,
    },
    data: {
      points: {
        // 使用 Prisma 提供的数学运算符对积分进行减一操作
        decrement: processInfo.usePoint,
      },
    },
  });
}
// 查询换脸结果接口
export default async (req, res) => {
  try {
    const { userId, requestId } = req.body;
    const res = await forwardToGPU({
      user_id: userId,
      request_id: requestId,
      sql_query: {
        request_status: '',
        user_id: '',
      },
    });
    if (res.data.status === 'finishing') {
      updataUserInfo(userId, requestId);
      saveImageData(res.data, userId);
    }
    return { data: res.data };
  } catch (error) {
    console.error('Error querying data from SQL:', error.message);
    return { data: error.message };
  } finally {
    await prisma.$disconnect();
  }
};

const uploadDirectory = projectRoot + '/static/sd_make_images/'; // 定义绝对路径

// 如果目录不存在，则创建目录
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const saveImageData = async (requestData, user_id) => {
  try {
    const outputImageBase64 = requestData.result?.images?.[0]; // 获取结果图片base64

    // 如果结果图片路径存在，则保存文件到本地
    if (outputImageBase64) {
      const fileName = `${requestData.request_id}.png`; // 文件名，可根据需要调整
      console.log('userid', user_id);
      let filePath = path.join(
        path.join(uploadDirectory, user_id),
        format(new Date(), 'yyyy-MM-dd')
      ); // 构建文件的绝对路径

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      filePath = path.join(filePath, fileName);

      // 将 base64 数据写入文件
      fs.writeFileSync(filePath, outputImageBase64, { encoding: 'base64' });

      console.log(`Image saved at: ${filePath}`);
      // 将文件路径保存到数据库
      await prisma.userProcessImageData.update({
        where: {
          requestId: requestData.request_id,
        },
        data: {
          outputImagePath: filePath, // 将文件路径保存到数据库
          requestStatus: 'finishing',
        },
      });
    }
  } catch (error) {
    console.error('Error saving image data:', error.message);
  }
};
