import { DateTime } from 'luxon';
import prisma from '../../../db/prisma.js';
import { STATIC_DIR } from '../../../config/index.js';

export default async (req, res) => {
  const { userId } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
  });
  //打开此处，修改所有用户积分
  //  let a= await prisma.user.delete({
  //     where: {
  //       userId
  //     },
  //   });
  //   return {a}
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
          userId: userId,
        },
        data: {
          isChecked: false,
        },
      });
      userSql.userHeadPic = userSql.userHeadPic.replace(
        STATIC_DIR,
        'https://facei.top/static'
      );

      return {
        data: {
          userId: userSql.userId,
          points: userSql.points,
          isChecked: userSql.isChecked,
          level: userSql.level,
          userHeadPic: userSql.userHeadPic,
        },
      };
    }

    user.userHeadPic = user.userHeadPic.replace(
      STATIC_DIR,
      'https://facei.top/static'
    );
    return {
      data: {
        userId: user.userId,
        points: user.points,
        isChecked: user.isChecked,
        level: user.level,
        userHeadPic: user.userHeadPic,
      },
    };
  }
};
