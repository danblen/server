import { DateTime } from 'luxon';
import prisma from '../../../db/prisma.js';

export default async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      userId: req.body.userId,
    },
  });
  //打开此处，修改所有用户积分
  // await prisma.user.updateMany({
  //   data: {
  //     points: 500,
  //   },
  // });
  if (!user) {
    return { data: null };
  } else {
    const today = DateTime.now().setZone('Asia/Shanghai');
    //先将时间字符串转换成时间格式
    const lastCheckInDate = DateTime.fromISO(user.lastCheckIn);

    if (!lastCheckInDate.hasSame(today, 'day')) {
      let userSql;
      userSql = await prisma.user.update({
        where: {
          userId: user.userId,
        },
        data: {
          isChecked: false,
        },
      });
      return { data: userSql };
    }

    return { data: user };
  }
};
