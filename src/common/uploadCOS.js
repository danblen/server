import fs from 'fs';
import COS from 'cos-nodejs-sdk-v5';
import { COSConfig, STATIC_DIR } from '../config/index.js';
import path from 'path';
import { getFilePathFromDir } from './fileUtils.js';
// 配置腾讯云 COS
// const cos = new COS({
//   SecretId: COSConfig.SecretId,
//   SecretKey: COSConfig.SecretKey,
// });

function uploadOne(Bucket, Region, filename, filePath) {
  cos.putObject(
    {
      Bucket,
      Region, // 你的桶所在地域
      Key: filename, // 在 COS 上保存的文件名
      Body: fs.createReadStream(filePath), // 从文件创建可读流
    },
    (err, data) => {
      if (err) {
        console.error('Error uploading to COS:', err);
        return;
      }

      // 构建图片在 COS 上的访问路径
      const cosUrl = `https://${data.Location}`;

      console.log(`Uploaded ${filename} to ${cosUrl}`);
    }
  );
}
const Bucket = 'userimages-1321542265';
const Region = 'ap-guangzhou';
const imageDir = STATIC_DIR + '/allImages';
// const filePaths = getFilePathFromDir(STATIC_DIR + '/allImages');
// console.log(filePaths);
function uploadBatch(filePaths) {
  filePaths.forEach((filePath) => {
    // 上传文件到 COS
    // const filename = path.basename(filePath);
    const filename = filePath.replace(imageDir, '');
    uploadOne(Bucket, Region, filename, filePath);
  });
}

// uploadBatch(filePaths);

// 获取 COS 存储桶列表
function getBucketList() {
  cos.getService((err, data) => {
    if (err) {
      console.error('Error getting bucket list:', err);
      return;
    }

    // 打印存储桶列表
    console.log('Bucket List:');
    data.Buckets.forEach((bucket) => {
      console.log(bucket.Name);
    });

    // 遍历每个存储桶并获取其对象列表
    data.Buckets.forEach((bucket) => {
      cos.getBucket(
        {
          Bucket: bucket.Name,
        },
        (err, data) => {
          if (err) {
            console.error(
              `Error getting objects in bucket ${bucket.Name}:`,
              err
            );
            return;
          }

          // 打印存储桶中的对象路径
          console.log(`Objects in bucket ${bucket.Name}:`);
          data.Contents.forEach((object) => {
            console.log(object.Key);
          });
        }
      );
    });
  });
}
// getBucketList();
