import prisma from '../../../db/prisma.js';
import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';
import { STATIC_DIR, projectRoot } from '../../../config/index.js';

const uploadDirectory = projectRoot + '/static/uploads'; // 定义绝对路径

function generateUniqueMomentId() {
  // 使用时间戳作为基础
  let momentId = Date.now().toString(36);

  // 添加随机数以确保唯一性
  momentId += Math.random().toString(36).substr(2, 5);

  return momentId;
}

//删除多个动态
export async function deleteUploadImagesOnMomentIds(req) {
  const { momentIds } = req.body; // 从请求体中获取 momentIds

  // 删除与这些动态相关的用户上传图片记录
  const deleteResult = await prisma.imageUserUpload.deleteMany({
    where: {
      momentId: { in: momentIds }, // 使用 "in" 操作符筛选多个 momentId
    },
  });

  // 返回删除成功的消息
  return { data: 'delete success' };
}

// 删除用户所有动态
export async function deleteUploadImagesOnUserId(req) {
  const { userId } = req.body;

  const usersToUpdate = await prisma.imageUserUpload.findMany({
    where: {
      userId: userId,
    },
  });
  const deleteResult = await prisma.imageUserUpload.deleteMany({
    where: {
      momentId: usersToUpdate.momentId,
    },
  });
  return { data: 'delete success' };
}

// 更新整个表的某个属性
export async function updateAllUploadImages() {
  const allUsers = await prisma.imageUserUpload.findMany();

  // 遍历所有记录并更新
  for (const user of allUsers) {
    // for (const user of usersToUpdate) {
    const updatedUser = await prisma.imageUserUpload.update({
      where: {
        momentId: user.momentId,
      },
      data: {
        // momentPics: user.momentPics.replace('.png', '.jpg'),
        viewCount: Math.floor(Math.random() * 50) + 1,
        isChecked: true,
        // userName: '试试就逝世',
      },
    });
  }
  return { data: 'success' };
}

export async function uploadImages(req) {
  try {
    const {
      userId,
      tagName,
      momentPics,
      momentText,
      momentTitle,
      userName,
      userHeadPic,
    } = req.body;
    // console.log(req.body);
    if (
      // !userId ||
      !momentPics ||
      !Array.isArray(momentPics) ||
      !tagName
      // || !momentTitle
    ) {
      throw new Error(
        'Missing required parameters or momentPics is not an array'
      );
    }

    let uploadTempPath = path.join(uploadDirectory, tagName);
    // 如果目录不存在，则创建目录
    if (!fs.existsSync(uploadTempPath)) {
      fs.mkdirSync(uploadTempPath, { recursive: true });
    }
    const momentId = generateUniqueMomentId();

    const imageUrls = momentPics
      .map((picData, index) => {
        if (!picData) return null;
        // 删除 base64 字符串中的前缀
        const base64Data = picData.replace(/^data:image\/\w+;base64,/, '');
        // 解码 base64 字符串为二进制数据
        const imageData = Buffer.from(base64Data, 'base64');
        // 生成文件路径，使用描述作为文件名
        const imagePath = path.join(
          uploadTempPath,
          `${momentId}-${index + 1}.png`
        );
        // 将图像数据写入文件
        fs.writeFileSync(imagePath, imageData);
        console.log(`momentPics ${index + 1} saved as:`, imagePath);
        return imagePath; // 返回图片路径
      })
      .filter(Boolean); // 过滤掉空值

    // 将多个图片的 URL 合并成一个字符串，使用逗号分隔
    const momentPicsString = imageUrls.join(',');
    const curDate = DateTime.now().setZone('Asia/Shanghai');

    // const user = await prisma.user.findUnique({
    //   where: {
    //     userId: userId,
    //   },
    // });
    // if (!user) {
    //   console.error('Error find user id:', userId);
    //   return { error: error.message };
    // }
    // 保存到数据库
    function generateRandomString(length) {
      const characters =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      return result;
    }

    // 生成随机userId
    const randomUserId = 'machine' + generateRandomString(8); // 假设随机字符串长度为8

    console.log('save', userName, userHeadPic);
    await prisma.imageUserUpload.create({
      data: {
        userId: randomUserId,
        userName: userName,
        userHeadPic: userHeadPic,
        momentId,
        momentText: '',
        momentPics: momentPicsString, // 将多个图片的 URL 合并成一个字符串
        momentTitle,
        tagName, // 将标签放入数组中
        createdAt: curDate,
      },
    });

    return { data: 'success' };
  } catch (error) {
    // 处理错误信息
    console.error('Error saving momentPics to local filesystem:', error);
    return { error: error.message };
  } finally {
    // 关闭数据库连接等操作
    await prisma.$disconnect();
  }
}
export async function getTagImages(req) {
  try {
    const { tagName } = req.body;
    if (!tagName) {
      throw new Error('Missing required parameters or tagName is null');
    }

    // 查询数据库并限制结果数量为200个
    const tagPics = await prisma.imageUserUpload.findMany({
      where: {
        tagName: tagName,
        isChecked: true,
      },
      take: 200,
    });

    // 随机排序并选择前200个元素
    const shuffledTagPics = tagPics
      .sort(() => Math.random() - 0.5)
      .slice(0, 200);

    // 更新路径并返回结果
    const updatedTagPics = shuffledTagPics.map((pic) => {
      if (pic.momentPics && pic.userHeadPic) {
        // 将 momentPics 中的本地路径替换为绝对路径
        const updatedMomentPics = pic.momentPics.replace(
          STATIC_DIR,
          'https://facei.top/static'
        );

        const updatedHeadPic = pic.userHeadPic.replace(
          STATIC_DIR,
          'https://facei.top/static'
        );

        // 返回更新后的记录
        return {
          ...pic,
          momentPics: updatedMomentPics,
          userHeadPic: updatedHeadPic,
        };
      }
    });

    return { data: updatedTagPics };
  } catch (error) {
    // 处理错误信息
    console.error('Error saving momentPics to local filesystem:', error);
    return { error: error.message };
  } finally {
    // 关闭数据库连接等操作
    await prisma.$disconnect();
  }
}

export async function updateImageUserUploadInfo(req) {
  const { momentId, ...updateData } = req.body;
  if (!momentId) {
    return null;
  }

  const processData = await prisma.imageUserUpload.findUnique({
    where: {
      momentId,
    },
  });

  if (!processData) {
    return null; // 数据不存在
  }

  // 将 viewCount 值加一
  updateData.viewCount = (processData.viewCount || 0) + 1;

  const updatedUser = await prisma.imageUserUpload.update({
    where: {
      momentId,
    },
    data: updateData,
  });
  return { data: updatedUser };
}
