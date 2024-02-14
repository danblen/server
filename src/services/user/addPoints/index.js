import prisma from '../../../db/prisma.js';

export default async (req, res) => {
  const user = await prisma.user.update({
    where: {
      userId: req.body.userId,
    },
    data: {
      points: {
        increment: 50,
      },
    },
  });
  if (!user) {
    return { data: null };
  } else {
    return { data: user };
  }
};
