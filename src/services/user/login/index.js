import wxLogin from './wxLogin.js';

/**
 * 登录，现在只有微信登录
 * @param event
 * @param context
 */
export default async (req, res) => {
	return wxLogin(req.body, res);
};
