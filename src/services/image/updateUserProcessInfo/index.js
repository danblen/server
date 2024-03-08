import prisma from '../../../db/prisma.js';

export default async (req, res) => {
  const { requestId, ...updateData } = req.body;

  if (!requestId) {
    return { data: 'check requestId' };
  }

  const processData = await prisma.UserProcessImageData.findUnique({
    where: {
      requestId,
    },
  });

  if (!processData) {
    return { data: 'check requestId' }; // 数据不存在
  }

  const updatedUser = await prisma.UserProcessImageData.update({
    where: {
      requestId,
    },
    data: updateData,
  });

  return { data: updatedUser };
};
