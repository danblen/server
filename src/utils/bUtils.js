const cheerio = require('cheerio');
const xss = require('xss');
const { WEB_HOST } = require('../constant');

/**
 * 检查用户是否合法
 * @param user
 */
const isValidUser = (user) => {
	if (!user?._id) {
		return false;
	}
	// 被删除或封禁
	if (user.isDelete || user.authority === 'ban') {
		console.log(`isValidUser invalid user = ${JSON.stringify(user)} `);
		return false;
	}
	return true;
};

/**
 * 是否为管理员
 * @param user
 * @returns {boolean}
 */
const isAdminUser = (user) => {
	if (!user?._id || !user.authority) {
		return false;
	}
	return user.authority.includes('admin');
};

module.exports = {
	isValidUser,
	isAdminUser,
};
