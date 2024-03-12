import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';
import prisma from '../../../db/prisma.js';
import { generateToken, generateUserId, getWXOpenId } from './utils.js';
import { STATIC_DIR, projectRoot } from '../../../config/index.js';
const uploadDirectory = projectRoot + '/static/pic';

async function createUser(openid, curDate) {
  // 指定目录路径
  const directoryPath = uploadDirectory;

  // 读取目录中的文件列表
  const files = await fs.promises.readdir(directoryPath);

  // 从文件列表中随机选择一个文件
  const randomFile = files[Math.floor(Math.random() * files.length)];

  // 构建完整的文件路径
  const filePath = path.join(directoryPath, randomFile);

  try {
    let userId = generateUserId();
    // 将选定的文件路径作为 userHeadPic 保存到数据库中
    const newUser = await prisma.user.create({
      data: {
        userId,
        openid,
        points: 20,
        isChecked: false,
        createdAt: curDate,
        userName: userId,
        userHeadPic: filePath, // 将选定的文件路径作为 userHeadPic
      },
    });
    const usersToUpdate = await prisma.imageUserUpload.findMany({
      where: {
        userId,
      },
    });

    // // 遍历符合条件的记录数组，并为每个记录执行更新操作
    for (const user of usersToUpdate) {
      await prisma.imageUserUpload.update({
        where: {
          momentId: user.momentId,
        },
        data: {
          userName: userId, // 更新关联的记录中的 userName
          userHeadPic: filePath,
        },
      });
    }

    return newUser;
  } catch (error) {
    console.error('Error creating new user:', error);
    return null;
  }
}

// 微信登陆接口
export default async (reqBody, res) => {
  try {
    const openid = await getWXOpenId(reqBody);
    if (!openid) {
      // 处理错误或返回适当的响应
      return {
        message: 'wechatResponse，openid 未定义或缺失。',
        data: null,
      };
    }

    // 从user表查询用户信息，使用userid查询，结果应唯一
    let user = await prisma.user.findUnique({
      where: {
        openid: openid,
      },
    });
    if (!user) {
      try {
        await prisma.user.update({
          where: {
            userId: openid,
          },
          data: {
            userId: generateUserId(),
            openid,
          },
        });
      } catch (error) {}
    }
    user = await prisma.user.findUnique({
      where: {
        openid: openid,
      },
    });

    const curDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    if (!user) {
      // 没查到， 创建新用户
      // 调用 createUser 函数，并传入必要的参数
      let newUser = await createUser(openid, curDate);
      const updatedMomentPics = newUser.userHeadPic.replace(
        STATIC_DIR,
        'https://facei.top/static'
      );
      const userInfo = {
        userId: newUser.userId,
        points: newUser.points,
        isChecked: newUser.isChecked,
        level: newUser.level,
        userHeadPic: updatedMomentPics,
        token: generateToken(newUser),
      };
      return { data: userInfo };
    } else {
      // 查到了，更新用户上次登录时间
      await prisma.user.update({
        where: {
          userId: user.userId,
        },
        data: {
          lastLoginAt: curDate,
          openid: openid,
        },
      });
      const updatedMomentPics = user.userHeadPic.replace(
        STATIC_DIR,
        'https://facei.top/static'
      );
      const userInfo = {
        userId: user.userId,
        points: user.points,
        isChecked: user.isChecked,
        level: user.level,
        token: generateToken(user),
        userHeadPic: updatedMomentPics,
      };
      return { data: userInfo };
    }
  } catch (error) {
    return { error, code: 500, message: 'Internal Server Error', data: null };
  } finally {
    await prisma.$disconnect();
  }
};
