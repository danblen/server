// 导入依赖模块
import fs from 'fs';
import path from 'path';
import {
  uploadImages,
  updateAllUploadImages,
  deleteUploadImagesOnMomentIds,
} from './services/image/uploadImages/index.js';

import { updateUserData } from './services/user/addPoints/index.js';

// 读取本地目录下的所有文件
function readFilesFromDirectory(directory) {
  return fs.readdirSync(directory);
}

// 读取文本文件内容
function readTextFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8').trim();
}

// 获取本地目录下的图片文件路径数组和文本文件路径
function getImagesFilesPaths(directory) {
  const files = readFilesFromDirectory(directory);
  const imageFiles = files.filter((file) =>
    /\.(jpg|jpeg|png|gif)$/i.test(file)
  );
  return { imageFiles };
}
function getTextFilesPaths(directory) {
  const files = readFilesFromDirectory(directory);
  const textFiles = files.find((file) => /\.txt$/i.test(file));
  return { textFiles };
}

function getRandomIndex(maxIndex) {
  return Math.floor(Math.random() * maxIndex);
}

function organizeData(imageFile, userNameFile, headFile) {
  const { imageFiles } = getImagesFilesPaths(imageFile);
  const headFiles = fs
    .readdirSync(headFile)
    .filter((file) => /\.(png|jpg|jpeg|gif)$/i.test(file))
    .map((file) => path.join(headFile, file));

  const userNameTexts = userNameFile
    ? readTextFile(userNameFile).split('\n')
    : [];

  console.log(imageFiles, userNameTexts);
  const moments = imageFiles.map((imagePath, index) => {
    const imageData = fs.readFileSync(path.join(imageFile, imagePath));
    const momentPic = `data:image/png;base64,${imageData.toString('base64')}`;
    const userName = userNameTexts ? userNameTexts[index].split('\n')[0] : '';

    // 随机选择一个头像文件的索引
    const randomHeadIndex = getRandomIndex(headFiles.length);
    const selectedHeadFile = headFiles[randomHeadIndex];

    console.log(
      'organizeData',
      path.join(imageFile, imagePath),
      userName,
      selectedHeadFile
    );

    return {
      momentPic,
      momentText: '',
      momentTitle: '',
      tagName: 'NEW',
      userName: userName,
      userHeadPic: selectedHeadFile,
    };
  });

  return moments;
}

// 调用 uploadImages 函数上传图片和文本数据
async function uploadImagesFromDirectory(imageFile, userNameText, headFile) {
  const moments = organizeData(imageFile, userNameText, headFile);
  const userId = '44a53aae'; // 设置用户 ID

  for (const moment of moments) {
    const {
      momentPic,
      momentText,
      momentTitle,
      tagName,
      userName,
      userHeadPic,
    } = moment;
    const req = {
      body: {
        // userId,
        tagName,
        momentPics: [momentPic],
        // momentText,
        momentTitle,
        userName,
        userHeadPic,
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

//删除多个动态
// const request = {
//   body: {
//     momentIds: ['ltg1p642iusmy'], // ID数组
//   },
// };
// deleteUploadImagesOnMomentIds(request);

// 更新整个表的check状态、viewCount
// updateAllUploadImages();

// 设置要上传的目录路径
// const headFile = '/home/ubuntu/code/server/static/pic';
// const imageFile = '/home/ubuntu/code/server/static/allImages/ins'; // 替换成实际的目录路径
// const userName = '/home/ubuntu/code/server/static/userName/userName.txt';
// uploadImagesFromDirectory(imageFile, userName, headFile);
updateUserData();
// updateAllUploadImages();
function renameImageFilesToJpg(directory) {
  // 获取目录下所有文件
  const files = fs.readdirSync(directory);

  // 过滤出图片文件
  const imageFiles = files.filter((file) =>
    /\.(png|jpg|jpeg|gif)$/i.test(file)
  );

  // 遍历图片文件，将文件名改成 .jpg 后缀
  imageFiles.forEach((file) => {
    const oldPath = path.join(directory, file);
    const newPath = path.join(directory, `${path.parse(file).name}.jpg`);
    fs.renameSync(oldPath, newPath);
  });
}

// 调用函数，将指定目录下的图片文件改成 .jpg 后缀
// const directory = '/path/to/directory'; // 替换为你的目录路径
// renameImageFilesToJpg(headFile);
