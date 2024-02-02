import fs from 'fs';
import path from 'path';
import forwardToGPU from './forwardToGPU.js';
import prisma from '../../../db/prisma.js';

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
	const gpuRes = await forwardToGPU(req.body);
	// 调用成功
	if (gpuRes?.data) {
		const requestId = gpuRes.data.request_id;
		// 保存图片到数据库
		await updateUserImage(req.body, requestId);
		return {
			data: { requestId, status: 'pending', type: 'img2img' },
		};
	} else {
		// 调用失败直接返回data为null
		return { code: 'error', data: null };
	}
};

// 更新userProcessImageData表中的任务数据
async function updateUserImage(reqBody, requestId) {
	try {
		const userId = reqBody.userId;
		if (!userId) {
			return;
		}

		await fs.promises.mkdir(imagesDir, { recursive: true });

		const allSaveImagePath = [];
		const processedJsonData = {};
		// processJsonData(
		// 	reqBody,
		// 	userId,
		// 	imagesDir,
		// 	allSaveImagePath,
		// 	processedJsonData,
		// 	null
		// );
		// const jsonString = JSON.stringify(processedJsonData);

		// 新建一条换脸任务的数据，保存数据到数据库
		const userTask = await prisma.userProcessImageData.create({
			data: {
				userId: userId,
				imageType: 'img2img',
				requestId: requestId,
				requestStatus: 'pending',
				mainImagePath: allSaveImagePath[0] || null,
				roopImagePath: allSaveImagePath[1] || null,
				// img2imgreqData: jsonString,
			},
		});

		// const recordsUserInfo = await db.query(UserInfo, {
		// 	where: { user_id: userId },
		// });
		// if (recordsUserInfo.length > 0) {
		// 	for (const recordUserInfo of recordsUserInfo) {
		// 		recordUserInfo.pending_works += 1;
		// 	}
		// }
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
async function saveImageToSql(request) {
	const db = SessionLocal();
	try {
		console.log('save image to sql 获取数据库信息：', request.request_id);
		const records = await db.query(UserSqlData, {
			where: { request_id: request.request_id },
		});
		const recordsUserInfo = await db.query(UserInfo, {
			where: { user_id: request.user_id },
		});
		const imageList = request.result.images;

		if (records.length > 0) {
			for (let idx = 0; idx < imageList.length; idx++) {
				const imageDataBase64 = imageList[idx];
				const imagesDir = path.join(
					projectRoot,
					'sd_make_images/output',
					request.user_id,
					new Date().toISOString().slice(0, 10)
				);
				fs.promises.mkdir(imagesDir, { recursive: true });

				const imageData = Buffer.from(imageDataBase64, 'base64');
				for (const record of records) {
					const imgFilename = `image_${record.user_id}_${record.request_id}_inx_${idx}.jpg`;
					const fullImgPath = path.join(imagesDir, imgFilename);
					await fs.promises.writeFile(fullImgPath, imageData);

					record.output_image_path = fullImgPath;
					record.request_status = request.status;
					record.before_process_time = request.before_process_time;
					record.process_time = request.process_time;

					if (recordsUserInfo.length > 0) {
						for (const recordUserInfo of recordsUserInfo) {
							recordUserInfo.points -= 1;
							recordUserInfo.finished_works.push(record.output_image_path);
							recordUserInfo.pending_works -= 1;
						}
					}
				}
				await db.commit();
				console.log('输出图像成功');
			}
		} else {
			console.log('未找到匹配的记录');
		}
	} finally {
		db.close();
	}
}

async function findImagesInDirectory(directory, db) {
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
	const records = await db.query(PhotoImage);

	for (const root of await fs.promises.readdir(directory)) {
		const files = await fs.promises.readdir(path.join(directory, root));

		for (const file of files) {
			if (imageExtensions.some((ext) => file.toLowerCase().endsWith(ext))) {
				try {
					const imgPath = path.join(directory, root, file);
					const existingImage = records.find(
						(record) => record.path === imgPath
					);

					const img = await Jimp.read(imgPath);
					const width = img.bitmap.width;
					const height = img.bitmap.height;
					const fileSize = (await fs.promises.stat(imgPath)).size / 1000;

					if (
						existingImage &&
						existingImage.width === width &&
						existingImage.height === height &&
						existingImage.file_size === fileSize
					) {
						continue;
					}

					const dbTask = PhotoImage.create({
						path: imgPath,
						file_size: fileSize,
						width: width,
						height: height,
					});
				} catch (error) {
					console.error(`Error opening or reading file: ${imgPath}`);
				}
			}
		}
	}
}

async function querySqlDataByDict(query) {
	const db = getDB();
	console.log('query_sql_data_by_dict', query);

	try {
		const filters = Object.entries(query).map(([key, value]) => ({
			[key]: value,
		}));

		const queryResult = await db.query(UserSqlData, {
			where: { [Op.and]: filters },
		});

		if (queryResult.length === 0) {
			console.log('没有找到数据', queryResult);
			return null;
		}

		const serializedResult = serializeQueryResult(queryResult, UserSqlData);
		return serializedResult;
	} catch (error) {
		console.error('Error querying data from SQL:', error.message);
		throw error;
	} finally {
		db.close();
	}
}
