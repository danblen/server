import prisma from '../../../db/prisma.js';

export default async (req, res) => {
  const { userLikeStatus, requestId } = req.body;
  if (!requestId) {
    return null;
  }
  const processData = await prisma.UserProcessImageData.findUnique({
    where: {
      requestId,
    },
  });

  if (!processData) {
    return null; // 用户不存在
  }
  const updatedUser = await prisma.UserProcessImageData.update({
    where: {
      requestId,
    },
    data: {
      userLikeStatus: userLikeStatus,
    },
  });
  return { data: updatedUser };
};
