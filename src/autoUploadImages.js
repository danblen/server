// 导入依赖模块
import fs from 'fs';
import path from 'path';
import {
  uploadImages,
  updateAllUploadImages,
} from './services/image/uploadImages/index.js';

// 读取本地目录下的所有文件
function readFilesFromDirectory(directory) {
  return fs.readdirSync(directory);
}

// 读取文本文件内容
function readTextFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8').trim();
}

// 获取本地目录下的图片文件路径数组和文本文件路径
function getFilesPaths(directory) {
  const files = readFilesFromDirectory(directory);
  const imageFiles = files.filter((file) =>
    /\.(jpg|jpeg|png|gif)$/i.test(file)
  );
  const textFiles = files.find((file) => /\.txt$/i.test(file));
  return { imageFiles, textFiles };
}

// 将本地目录下的图片和文本组织成对应的数据结构
function organizeData(directory) {
  const { imageFiles, textFiles } = getFilesPaths(directory);
  const momentTexts = textFiles
    ? readTextFile(path.join(directory, textFiles)).split('\n')
    : [];

  const moments = imageFiles.map((imageFile, index) => {
    const imageData = fs.readFileSync(path.join(directory, imageFile));
    const momentPic = `data:image/png;base64,${imageData.toString('base64')}`;
    const tagName = path.basename(directory);
    const momentTitle = textFiles ? momentTexts[index].split('\n')[0] : ''; // 如果没有文本文件，则默认为空
    return { momentPic, momentText: momentTexts[index], momentTitle, tagName };
  });

  return moments;
}

// 调用 uploadImages 函数上传图片和文本数据
async function uploadImagesFromDirectory(directory) {
  const moments = organizeData(directory);
  const userId = '44a53aae'; // 设置用户 ID

  for (const moment of moments) {
    const { momentPic, momentText, momentTitle, tagName } = moment;
    const req = {
      body: {
        userId,
        tagName,
        momentPics: [momentPic],
        // momentText,
        momentTitle,
      },
    };
    try {
      const result = await uploadImages(req);
      console.log(result);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  }
  await updateAllUploadImages();
}

// 设置要上传的目录路径
const directoryPath = '/home/ubuntu/code/server/static/allImages/tags/美高Boy'; // 替换成实际的目录路径
uploadImagesFromDirectory(directoryPath);
