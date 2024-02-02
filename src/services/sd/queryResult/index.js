import fs from 'fs';
import path from 'path';
import forwardToGPU from './forwardToGPU.js';
import prisma from '../../../db/prisma.js';
export default async (req, res) => {
	try {
		let res = await forwardToGPU({
			user_id: req.body.userId,
			request_id: req.body.requestId,
			sql_query: {
				request_status: '',
				user_id: '',
			},
		});
		if (res.data.status === 'finishing') {
			saveImageData(res.data);
		}
		return { data: res.data };
	} catch (error) {
		console.error('Error querying data from SQL:', error.message);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
};

const saveImageData = async (requestData) => {
	try {
		const records = await prisma.userProcessImageData.findMany({
			where: {
				requestId: requestData.request_id,
			},
		});

		const recordsUserInfo = await prisma.user.findMany({
			where: {
				userId: requestData.user_id,
			},
		});

		const imageList = requestData.result.images;

		if (records.length > 0) {
			for (let idx = 0; idx < imageList.length; idx++) {
				const imageDataBase64 = imageList[idx];
				const imagesDir = path.join(
					__dirname,
					'sd_make_images/output',
					requestData.user_id,
					new Date().toISOString().slice(0, 10)
				);
				await fs.promises.mkdir(imagesDir, { recursive: true });

				const imageData = Buffer.from(imageDataBase64, 'base64');
				for (const record of records) {
					const imgFilename = `image_${record.userId}_${record.requestId}_inx_${idx}.jpg`;
					const fullImgPath = path.join(imagesDir, imgFilename);
					await fs.promises.writeFile(fullImgPath, imageData);

					await prisma.userProcessImageData.update({
						where: {
							requestId: record.requestId,
						},
						data: {
							outputImagePath: fullImgPath,
							requestStatus: requestData.status,
							beforProcessTime: requestData.befor_process_time,
							processTime: requestData.process_time,
						},
					});

					if (recordsUserInfo.length > 0) {
						const recordUser = recordsUserInfo[0];
						recordUser.points = Math.max(recordUser.points - 1, 0);
						await prisma.user.update({
							where: {
								userId: recordUser.userId,
							},
							data: {
								points: recordUser.points,
							},
						});
					}
				}
			}
			console.log('输出图像成功');
		} else {
			console.log('未找到匹配的记录');
		}
	} catch (error) {
		console.error('保存图像到数据库时出错:', error);
	}
};
