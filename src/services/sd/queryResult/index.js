import prisma from '../../../db/prisma.js';
import forwardToGPU from './forwardToGPU.js';
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
		await prisma.userProcessImageData.update({
			where: {
				requestId: requestData.request_id,
			},
			data: {
				outputImagePath: requestData.result.images[0],
				requestStatus: 'finishing',
			},
		});
	} catch (error) {}
};
