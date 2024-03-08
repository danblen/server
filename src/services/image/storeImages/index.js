// import { elasticClient } from '../../../db/elasticSearch.js';
import prisma from '../../../db/prisma.js';

// const imageUrls = [
//   'https://facei.top/static/allImages/banner/photo_112@05-11-2022_05-24-49.jpg',
//   'https://facei.top/static/allImages/banner/photo_109@05-11-2022_05-24-49.jpg',
//   'https://facei.top/static/allImages/banner/photo_108@05-11-2022_05-24-49.jpg',
//   'https://facei.top/static/allImages/banner/photo_111@05-11-2022_05-24-49.jpg',
// ];

// 用来批量存图片索引到数据库，不提供给前端使用
// export default async (req, res) => {
//   // const { data, tags } = req.body;
//   for (const imageUrl of imageUrls) {
//     await prisma.imageIndex.create({
//       data: {
//         imageUrl: imageUrl,
//         category: 'banner',
//         // data,
//         // tags,
//       },
//     });
//   }
//   const result = await prisma.imageIndex.findMany();
//   return { code: 'success', data };
// };
export default async (req, res) => {
  // const { data, tags } = req.body;
  // async function indexImage(imageMetadata) {
  //   await elasticClient.index({
  //     index: 'images',
  //     body: imageMetadata,
  //   });
  // }
  // // 示例图片元数据
  // const sampleImageMetadata = {
  //   filename: 'sample.jpg',
  //   path: '/images/sample.jpg',
  //   tags: ['nature', 'landscape'],
  //   // 其他图片元数据字段
  // };
  // indexImage(sampleImageMetadata).catch(console.error);
  // return { code: 'success', data };
};
