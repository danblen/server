import prisma from '../../../db/prisma.js';

export default async (req, res) => {
  const { userId } = req.body;
  const today = new Date().toISOString().split('T')[0]; // 获取当前日期（格式：YYYY-MM-DD）
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
  });

  if (!user) {
    return null; // 用户不存在
  }

  // 如果上次签到日期不是今天，则进行签到
  if (user.lastCheckIn !== today) {
    const updatedUser = await prisma.user.update({
      where: {
        userId,
      },
      data: {
        points: {
          increment: 1,
        },
        isChecked: true,
        lastCheckIn: today, // 更新上次签到日期
      },
    });

    return { data: updatedUser };
  } else {
    return { data: null }; // 今天已经签到过了
  }
};
