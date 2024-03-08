import { Client } from '@elastic/elasticsearch';

// export const elasticClient = new Client({ node: 'http://localhost:9200' });

// async function createIndex() {
//   await elasticClient.indices.create({
//     index: 'images',
//     body: {
//       mappings: {
//         properties: {
//           filename: { type: 'text' },
//           path: { type: 'text' },
//           tags: { type: 'text' },
//           // 其他图片元数据字段
//         },
//       },
//     },
//   });
// }

// createIndex().catch(console.error);
