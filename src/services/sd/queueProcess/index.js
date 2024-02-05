import path from 'path';
import prisma from '../../../db/prisma.js';
import forwardToGPU from './forwardToGPU.js';

// 工程根目录
const projectRoot = path.resolve(new URL(import.meta.url).pathname, '../');
// 图片目录
const imagesDir = path.join(
	projectRoot,
	'sd_make_images',
	new Date().toISOString().slice(0, 10)
);

// 换脸接口
export default async (req, res) => {
	const { userId } = req.body;
	const user = await prisma.user.findUnique({
		where: { userId },
	});
	if (user.points < 1) {
		return { error: 'no points' };
	}
	const gpuRes = await forwardToGPU(req.body);
	// 调用成功
	if (gpuRes?.data) {
		const requestId = gpuRes.data.request_id;
		// 保存图片到数据库，积分需要减1
		updateUserImage(req.body, requestId);
		updataUserInfo(userId);
		return {
			data: { requestId, status: 'pending', type: 'img2img' },
		};
	} else {
		// 调用失败直接返回data为null
		return { code: 'error', data: null };
	}
};
function updataUserInfo(userId) {
	prisma.user.update({
		where: {
			userId,
		},
		data: {
			points: {
				// 使用 Prisma 提供的数学运算符对积分进行减一操作
				decrement: 1,
			},
		},
	});
}
// 更新userProcessImageData表中的任务数据
async function updateUserImage(reqBody, requestId) {
	try {
		const userId = reqBody.userId;
		if (!userId) {
			return;
		}

		// 新建一条换脸任务的数据，保存数据到数据库
		const userTask = await prisma.userProcessImageData.create({
			data: {
				userId: userId,
				imageType: 'img2img',
				requestId: requestId,
				requestStatus: 'pending',
				mainImagePath: reqBody.init_images[0] || null,
				roopImagePath: reqBody.alwayson_scripts.roop.args[0] || null,
			},
		});

		// 如果保存成功
		if (userTask.userId) {
			return;
		} else {
		}
	} catch (error) {
		console.error('Error updating user info in SQL:', error.message);
	} finally {
		await prisma.$disconnect();
	}
}
