import prisma from '../../../db/prisma.js';

// 上传图片和保存到数据库
export default async (req) => {
	try {
		const { userId, image, tag } = req.body;

		// 解码base64数据
		// const imageBuffer = Buffer.from(image, 'base64');

		// 保存到数据库
		await prisma.imageUserUpload.create({
			data: {
				userId,
				data: image,
				contentType: 'image/png', // 根据实际情况设置
				tags: 'userUpload' + ',' + tag,
			},
		});
		return { data: 'success' };
	} catch (error) {
		return { error };
	} finally {
		await prisma.$disconnect(); // 关闭数据库连接
	}
};
