import prisma from '../../../db/prisma.js';
import { pushMsg } from '../../notify/pushMsg.js';

export const notifyUser = async (task) => {
  const user = await prisma.user.findUnique({
    where: {
      userId: task.userId,
    },
  });
  pushMsg({
    openid: user.openid,
  });
};
export const notifyUsers = (tasks) => {
  tasks.forEach((task) => {
    notifyUser(task);
  });
};
