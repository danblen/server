import axios from 'axios';
import { ENV } from '../../../config/index.js';

// 调用sd接口，进行换脸
export default async (data) => {
	try {
		let response = await axios.post(
			`${ENV.GPU_HOST}/sdapi/v1/queue-process`,
			data
		);
		return { data: response.data };
	} catch (error) {
		return { error, data: null };
	}
};
