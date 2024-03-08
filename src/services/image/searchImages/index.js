import { elasticClient } from '../../../db/elasticSearch';

export default async (req) => {
  try {
    const { keyword } = req.body;

    // 执行 Elasticsearch 查询
    const { body } = await elasticClient.search({
      index: 'images',
      body: {
        query: {
          match: {
            tags: keyword,
          },
        },
      },
    });

    // 提取查询结果中的图片信息
    const imageResults = body.hits.hits.map((hit) => ({
      id: hit._id,
      filename: hit._source.filename,
      path: hit._source.path,
      // 其他图片信息
    }));

    // 返回查询结果
    return imageResults;
  } catch (error) {
    console.error(error);
  }
};
