import fs from 'fs/promises';
import path from 'path';

export async function saveBase64Image(base64Data, fullPathDir, fileName) {
  if (!base64Data) return null;
  try {
    await fs.mkdir(fullPathDir, { recursive: true });
    await fs.writeFile(
      fullPathDir + '/' + fileName,
      Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    );
    return `${fullPathDir}/${fileName}`; // 返回保存的文件路径
  } catch (error) {
    console.error('Error saving base64 image:', error.message);
    return null;
  }
}
