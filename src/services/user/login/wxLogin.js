import axios from 'axios';
import { wxConfig } from '../../../config/wxConfig.js';
import prisma from '../../../db/prisma.js';
import { format } from 'date-fns';

import { projectRoot } from '../../../common/path.js';
import fs from 'fs';
import path from 'path';
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
    // 将选定的文件路径作为 userHeadPic 保存到数据库中
    const newUser = await prisma.user.create({
      data: {
        userId: openid,
        points: 10,
        isChecked: false,
        createdAt: curDate,
        userName: openid,
        userHeadPic: filePath, // 将选定的文件路径作为 userHeadPic
      },
    });
    const usersToUpdate = await prisma.imageUserUpload.findMany({
      where: {
        userId: openid,
      },
    });

    // // 遍历符合条件的记录数组，并为每个记录执行更新操作
    for (const user of usersToUpdate) {
      const updatedUser = await prisma.imageUserUpload.update({
        where: {
          momentId: user.momentId,
        },
        data: {
          userName: openid, // 更新关联的记录中的 userName
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
    // 调微信登陆api
    const wechatResponse = await axios.get(wxConfig.url, {
      params: {
        appid: wxConfig.appid,
        secret: wxConfig.secret,
        js_code: reqBody.code,
        grant_type: wxConfig.grant_type,
      },
    });
    // 返回微信接口的数据，openid为唯一用户标识
    const wechatData = wechatResponse.data;
    const { openid } = wechatData;
    if (!openid) {
      // 处理错误或返回适当的响应
      return {
        code: 500,
        message: 'wechatResponse，openid 未定义或缺失。',
        data: null,
      };
    }
    // 从user表查询用户信息，使用userid查询，结果应唯一
    const user = await prisma.user.findUnique({
      where: {
        userId: openid,
      },
    });
    const curDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    if (!user) {
      // 没查到， 创建新用户
      // 调用 createUser 函数，并传入必要的参数
      let newUser = await createUser(openid, curDate);
      console.log('New user created:', newUser);
      if (!newUser) {
        return { code: 500, message: 'Internal Server Error', data: null };
      }
      const updatedMomentPics = newUser.userHeadPic.replace(
        '/home/ubuntu/code/server/static/',
        'https://facei.top/static/'
      );
      const userInfo = {
        userId: newUser.userId,
        points: newUser.points,
        isChecked: newUser.isChecked,
        userHeadPic: updatedMomentPics,
      };
      const responseData = { code: 200, data: userInfo };
      return responseData;
    } else {
      // 查到了，更新用户信息
      await prisma.user.update({
        where: {
          userId: openid,
        },
        data: {
          lastLoginAt: curDate,
        },
      });

      const updatedMomentPics = user.userHeadPic.replace(
        '/home/ubuntu/code/server/static/',
        'https://facei.top/static/'
      );
      const userInfo = {
        userId: user.userId,
        points: user.points,
        isChecked: user.isChecked,
        userHeadPic: updatedMomentPics,
      };
      return { code: 200, data: userInfo };
    }
  } catch (error) {
    return { error, code: 500, message: 'Internal Server Error', data: null };
  } finally {
    await prisma.$disconnect();
  }
};
