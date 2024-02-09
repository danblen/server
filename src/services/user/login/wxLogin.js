import axios from 'axios';
import { wxConfig } from '../../../config/wxConfig.js';
import prisma from '../../../db/prisma.js';
import moment from 'moment';

// 微信登陆接口
export default async (reqBody, res) => {
	try {
		// 调微信登陆api
		const wechatResponse = await axios.get(wxConfig.url, {
			params: {
				appid: wxConfig.appid,
				secret: wxConfig.secret,
				js_code: reqBody.code,
				grant_type: wxConfig.grant_type,
			},
		});
		// 返回微信接口的数据，openid为唯一用户标识
		const wechatData = wechatResponse.data;
		const { openid } = wechatData;
		// 从user表查询用户信息，使用userid查询，结果应唯一
		const user = await prisma.user.findUnique({
			where: {
				userId: openid,
			},
		});

		if (!user) {
			const chinaTime = moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss');
			// 没查到， 创建新用户
			const newUser = await prisma.user.create({
				data: {
					userId: openid,
					points: 20,
					isChecked: false,
					createdAt: chinaTime,
				},
			});

			const userInfo = {
				userId: newUser.userId,
				points: newUser.points,
				isChecked: newUser.isChecked,
			};
			const responseData = { code: 200, data: userInfo };
			return responseData;
		} else {
			// 查到了，更新用户信息
			await prisma.user.update({
				where: {
					userId: openid,
				},
				data: {
					lastLoginAt: moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss'),
				},
			});

			const userInfo = {
				userId: user.userId,
				points: user.points,
				isChecked: user.isChecked,
				createdAt: moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss'), // 将中国时间作为 createdAt 字段的值
			};
			return { code: 200, data: userInfo };
		}
	} catch (error) {
		return { code: 500, message: 'Internal Server Error', data: null };
	} finally {
		await prisma.$disconnect();
	}
};
