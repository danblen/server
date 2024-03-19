import fs from 'fs';
import path from 'path';

// 用法示例：遍历指定文件夹下的所有文件并构建对象
// const filePathObject = getFilePathFromDir( STATIC_DIR + '/allImages');
// console.log(filePathObject);
// 返回
// ['/home/ubuntu/code/server/static/allImages/icons8-首页-64.png', '/home/ubuntu/code/server/static/allImages/icons8-首页-64.png']
export function getFilePathFromDir(folderPath) {
  const filePathObject = [];

  function traverseFolder(currentFolderPath) {
    const files = fs.readdirSync(currentFolderPath);

    files.forEach((file) => {
      const filePath = path.join(currentFolderPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        // 如果是目录，则递归遍历该目录
        traverseFolder(filePath);
      } else {
        // 如果是文件，则将文件路径添加到对象中
        filePathObject.push(filePath);
      }
    });
  }

  traverseFolder(folderPath);

  return filePathObject;
}

function getFolderStructureJSON(rootDir) {
  const stats = fs.statSync(rootDir);
  if (!stats.isDirectory()) {
    throw new Error('The provided path is not a directory.');
  }

  function readDirectory(dir) {
    const files = fs.readdirSync(dir);
    const folder = {
      name: path.basename(dir),
      path: path.relative(rootDir, dir),
      files: [],
    };

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        folder.files.push(readDirectory(filePath)); // Recursively read subdirectories
      } else {
        folder.files.push({
          name: file,
          path: path.relative(rootDir, filePath),
        }); // Add file to files array
      }
    });

    return folder;
  }

  return readDirectory(rootDir);
}
function getFileName(filePath) {
  const fileName = path.basename(filePath);
  console.log(fileName); // 输出: 'icons8-首页-64.png'
}
function getFileNameWithoutExt(filePath) {
  const fileNameWithoutExt = path.basename(filePath, path.extname(filePath));
  console.log(fileNameWithoutExt); // 输出: 'icons8-首页-64'
}
