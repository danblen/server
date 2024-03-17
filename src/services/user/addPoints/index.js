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

export async function updateUserData() {
  const allUsers = await prisma.user.findMany();

  // 遍历所有记录并更新
  for (const user of allUsers) {
    // for (const user of usersToUpdate) {
    const updatedUser = await prisma.user.update({
      where: {
        userId: user.userId,
      },
      data: {
        // momentPics: user.momentPics.replace('.png', '.jpg'),
        // viewCount: Math.floor(Math.random() * 50) + 1,
        // isChecked: true,
        // userName: '试试就逝世',
        points: 999,
      },
    });
  }
  return { data: 'success' };
}
