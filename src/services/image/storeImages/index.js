import prisma from '../../../db/prisma.js';

const imageUrls = [
	'https://facei.top/statics/allImages/banner/photo_112@05-11-2022_05-24-49.jpg',
	'https://facei.top/statics/allImages/banner/photo_109@05-11-2022_05-24-49.jpg',
	'https://facei.top/statics/allImages/banner/photo_108@05-11-2022_05-24-49.jpg',
	'https://facei.top/statics/allImages/banner/photo_111@05-11-2022_05-24-49.jpg',
];

// 用来批量存图片索引到数据库，不提供给前端使用
export default async (req, res) => {
	// const { data, tags } = req.body;
	for (const imageUrl of imageUrls) {
		await prisma.imageIndex.create({
			data: {
				imageUrl: imageUrl,
				category: 'banner',
				// data,
				// tags,
			},
		});
	}
	const result = await prisma.imageIndex.findMany();
	return { code: 'success', data };
};
