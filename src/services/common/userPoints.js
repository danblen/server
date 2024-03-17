import prisma from '../../db/prisma.js';

export const decreaseUserPoints = async (userId, usePoint) => {
  await prisma.user.update({
    where: {
      userId,
    },
    data: {
      points: {
        // 使用 Prisma 提供的数学运算符对积分进行减一操作
        decrement: usePoint,
      },
    },
  });
};
export const addUserPoints = async (userId, usePoint) => {
  await prisma.user.update({
    where: {
      userId,
    },
    data: {
      points: {
        // 使用 Prisma 提供的数学运算符对积分进行加一操作
        increment: usePoint,
      },
    },
  });
};
