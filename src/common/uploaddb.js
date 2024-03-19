import { STATIC_DIR } from '../config';
import prisma from '../db/prisma';
import { getFilePathFromDir } from './file';

export const uploadDB = async () => {
  // Get the file from the request

  const filePaths = getFilePathFromDir(STATIC_DIR + '/allImages');
  // Save the file to the server
  await prisma.image.create({
    data: {
      name: filePaths.name,
      path: filePaths.path,
      type: 'album',
    },
  });
  console.log('File uploaded successfully');
};
uploadDB();
