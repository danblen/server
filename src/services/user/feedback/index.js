import fs from 'fs/promises';
import { format } from 'date-fns';
import path from 'path';
import { saveBase64Image } from '../../../common/file.js';
import { DateTime } from 'luxon';
import prisma from '../../../db/prisma.js';
import { ENV, STATIC_DIR } from '../../../config/index.js';

export default async (req) => {
  const { userId, image, desc } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      userId,
    },
  });

  if (!user) {
    return { data: 'can not find user id' }; // 用户不存在
  }

  try {
    if (image != null) {
      const relativePathDir = path.join(
        '/feedBack',
        userId,
        format(new Date(), 'yyyy-MM-dd')
      );
      const fileName = `${Date.now()}-${desc}.jpg`;
      await saveBase64Image(image, STATIC_DIR + relativePathDir, fileName);
    } else {
      const relativePathDir = path.join(
        '/feedBack',
        userId,
        format(new Date(), 'yyyy-MM-dd')
      );
      await fs.mkdir(STATIC_DIR + relativePathDir, { recursive: true });
      await fs.writeFile(
        STATIC_DIR + relativePathDir + '/' + desc + '.txt',
        ''
      );
    }
    return { data: 'success' };
  } catch (error) {
    console.log('Error feedback:', error);
    return { data: 'error' };
  }
};
