import axios from 'axios';

// 调用sd接口，进行换脸
export default async (data) => {
	try {
		let response = await axios.post(
			`http://lyg.blockelite.cn:22164/sdapi/v1/queue-process`,
			data
		);
		return { data: response.data };
	} catch (error) {
		return { error, data: null };
	}
};
