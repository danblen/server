import path from 'path';
import fs from 'fs';
import { ENV, projectRoot } from '../../../config/index.js';
import prisma from '../../../db/prisma.js';

export default async (req, res) => {
  const queryParamsArray = req.body;
  if (!queryParamsArray) {
    throw new Error('Missing required parameters or tagName is null');
  }
  const resultArray = [];

  // 对每个查询参数进行查询并添加到结果数组中
  await Promise.all(
    queryParamsArray.map(async (queryParams, index) => {
      // 执行查询图片记录
      const tagPics = await prisma.imageIndex.findMany({
        where: queryParams, // 使用传入的查询参数作为条件
      });

      // 将查询结果添加到结果数组的正确位置
      resultArray[index] = tagPics;
    })
  );
  const result = resultArray.map((tagPicArray) =>
    tagPicArray.map((tagPic) => {
      if (tagPic.data) {
        tagPic.data = JSON.parse(tagPic.data).map(
          (item) => ENV.URL_STATIC + item
        );
      }
      tagPic.imageUrl = ENV.URL_STATIC + tagPic.imageUrl;
      return tagPic;
    })
  );

  return { data: result };
};
