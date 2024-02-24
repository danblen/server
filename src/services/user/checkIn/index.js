import { DateTime } from 'luxon';
import prisma from '../../../db/prisma.js';

export default async (req, res) => {
  const { userId } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
  });

  if (!user) {
    return null; // 用户不存在
  }
  const today = DateTime.now().setZone('Asia/Shanghai');
  //先将时间字符串转换成时间格式
  const lastCheckInDate = DateTime.fromISO(user.lastCheckIn);
  // 如果上次签到日期不是今天，则进行签到
  if (!lastCheckInDate.hasSame(today, 'day')) {
    let updatedUser = await prisma.user.update({
      where: {
        userId,
      },
      data: {
        points: {
          increment: 2,
        },
        isChecked: true,
        lastCheckIn: today, // 更新上次签到日期
      },
    });
    updatedUser.userHeadPic = updatedUser.userHeadPic.replace(
      '/home/ubuntu/code/server/static/',
      'https://facei.top/static/'
    );
    return { data: updatedUser };
  } else {
    return { data: null }; // 今天已经签到过了
  }
};
