import prisma from '../../../db/prisma.js';
import forwardToGPU from './forwardToGPU.js';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';
import { ENV, projectRoot } from '../../../config/index.js';

export default async (req, res) => {
  const image = await prisma.userProcessImageData.findUnique({
    where: {
      requestId: req.body.requestId,
    },
  });
  if (image) {
    return {
      data: {
        imageUrl: ENV.URL_STATIC + image.outputImagePath,
        status: image.requestStatus,
      },
    };
  }
  return { data: null };
};
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
// export default async (req, res) => {
//   try {
//     const { userId, requestId } = req.body;
//     const res = await forwardToGPU({
//       user_id: userId,
//       request_id: requestId,
//       sql_query: {
//         request_status: '',
//         user_id: '',
//       },
//     });
//     if (res.data.status === 'finishing') {
//       updataUserInfo(userId, requestId);
//       const { fullPath, relativePath } = getPathAndMakeDir(requestId, userId);
//       saveImageData(res.data, userId, fullPath);
//       return { data: { status: res.data.status, imageUrl: relativePath } };
//     }
//     return { data: { status: res.data.status, imageUrl: '' } };
//   } catch (error) {
//     console.error('Error querying data from SQL:', error.message);
//     return { data: error.message };
//   } finally {
//     await prisma.$disconnect();
//   }
// };

const uploadDirectory = projectRoot + '/static/sd_make_images/'; // 定义绝对路径
const staticDirectory = projectRoot + '/static';
// 如果目录不存在，则创建目录
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}
const getPathAndMakeDir = (request_id, user_id) => {
  const fileName = `${request_id}.png`; // 文件名，可根据需要调整
  let relativeDir = path.join(
    '/sd_make_images',
    user_id,
    format(new Date(), 'yyyy-MM-dd')
  );
  let fullPathDir = staticDirectory + relativeDir;
  if (!fs.existsSync(fullPathDir)) {
    fs.mkdirSync(fullPathDir, { recursive: true });
  }
  let relativePath = relativeDir + fileName;
  let fullPath = path.join(staticDirectory, relativePath); // 构建文件的绝对路径
  return { fullPath, relativePath };
};

const saveImageData = async (requestData, user_id, fullPath) => {
  try {
    const outputImageBase64 = requestData.result?.images?.[0]; // 获取结果图片base64

    // 如果结果图片路径存在，则保存文件到本地
    if (outputImageBase64) {
      // 将 base64 数据写入文件
      fs.writeFileSync(fullPath, outputImageBase64, { encoding: 'base64' });

      console.log(`Image saved at: ${fullPath}`);
      // 将文件路径保存到数据库
      await prisma.userProcessImageData.update({
        where: {
          requestId: requestData.request_id,
        },
        data: {
          outputImagePath: fullPath, // 将文件路径保存到数据库
          requestStatus: 'finishing',
        },
      });
    }
  } catch (error) {
    console.error('Error saving image data:', error.message);
  }
};
