import prisma from '../../../db/prisma.js';

export default async (req, res) => {
  const { userId, ...updateData } = req.body;

  if (!userId) {
    return { data: 'check userId' };
  }

  const userData = await prisma.User.findUnique({
    where: {
      userId,
    },
  });

  if (!userData) {
    return { data: 'check userId' }; // 数据不存在
  }

  const updatedUser = await prisma.User.update({
    where: {
      userId,
    },
    data: updateData,
  });

  return { data: updatedUser };
};
