import path from 'path';
import fs from 'fs';
import prisma from '../../../db/prisma.js';
import { saveBase64Image } from '../../../common/file.js';
import { decreaseUserPoints } from '../../common/userPoints.js';
import { addTaskInSDRunningTasks } from '../../common/processQueueSql.js';
import { STATIC_DIR } from '../../../config/index.js';

export default async (req, res) => {
  const { userId, requestId, usePoint = 1, userTrainImages } = req.body;
  // return { message: 'add task or save images error' };
  if (!userId || !requestId || !userTrainImages) {
    return { message: 'no userId' };
  }
  if (!userTrainImages.length) {
    return { message: 'User tarin pic not found' };
  }
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
  });

  if (!user) {
    return { message: 'User not found' };
  }

  if (user.points < usePoint) {
    return { message: '积分不够了~' };
  }

  try {
    const userTrainDataPath = path.join(
      '/home/ubuntu/code/server/static/userTrainImage',
      userId
    );
    if (!fs.existsSync(userTrainDataPath)) {
      fs.mkdirSync(userTrainDataPath, { recursive: true });
    } else {
      // 读取目录中的文件
      fs.readdirSync(userTrainDataPath).forEach((file) => {
        // 构建文件路径
        const filePath = path.join(userTrainDataPath, file);
        // 删除文件
        fs.unlinkSync(filePath);
      });
    }

    let userTrainPic = [];
    for (let i = 0; i < userTrainImages.length; i++) {
      const imagePath = await saveBase64Image(
        userTrainImages[i],
        userTrainDataPath,
        `image_${i + 1}.jpg`
      );
      console.log('imagePath', imagePath);
      userTrainPic.push(imagePath);
    }

    if (!userTrainPic.length) {
      return { message: 'save user images error' };
    }

    if (!user) {
      return { data: 'check userId' }; // 数据不存在
    }

    let updateUser = await prisma.User.update({
      where: {
        userId,
      },
      data: {
        userTrainPic: JSON.stringify(userTrainPic),
        loraName: '',
        loraStatus: 'pending',
      },
    });
    updateUser.userHeadPic = updateUser.userHeadPic.replace(
      STATIC_DIR,
      'https://facei.top/static'
    );

    if (
      !addTaskInSDRunningTasks(
        userId,
        requestId,
        usePoint,
        null,
        null,
        'train',
        userTrainDataPath,
        null
      )
    ) {
      return { message: 'add task error' };
    }
    decreaseUserPoints(userId, usePoint);

    console.log(`addTaskInSDRunningTasks success`);
    return {
      data: {
        userId: updateUser.userId,
        points: updateUser.points,
        isChecked: updateUser.isChecked,
        level: updateUser.level,
        userHeadPic: updateUser.userHeadPic,
        userName: updateUser.userName,
        loraPic: updateUser.loraPic,
        loraStatus: updateUser.loraStatus,
      },
    };
  } catch (error) {
    console.error('Error occurred:', error);
    return { message: 'add task or save images error' };
  }
};
