import prisma from '../../../db/prisma.js';

// 查询图片接口
export default async (req) => {
	const { tags } = req.body;

	// 查询数据库
	const data = await prisma.imageIndex.findMany({
		where: {
			tags: {
				hasSome: tags.split(','), // 根据标签查询
			},
		},
	});
	return { data };
};
