import { format } from 'date-fns';
import prisma from '../../../db/prisma.js';
import { pushMsg } from '../../notify/pushMsg.js';
import { adminopenid } from '../../../config/index.js';

export const notifyUser = async (task) => {
  const user = await prisma.user.findUnique({
    where: {
      userId: task.userId,
    },
  });
  pushMsg({
    openid: user.openid,
    data: {
      thing1: {
        value: '生成图任务',
      },
      thing5: {
        value: '文生图',
      },
      date2: {
        value: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      },
    },
  });
};
export const notifyAdmin = async (tasks) => {
  pushMsg({
    openid: adminopenid,
    data: {
      thing1: {
        value: tasks.length,
      },
      thing5: {
        value: tasks.map((task) => task.userId).join(','),
      },
      date2: {
        value: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      },
    },
  });
};
export const notifyUsers = (tasks) => {
  tasks.forEach((task) => {
    notifyUser(task);
  });
  notifyAdmin(tasks);
};
