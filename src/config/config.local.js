/**
 * 默认配置
 */
module.exports = {
	tcbConfig: {
		env: 'facei-test-xxx', // 改为你的云开发 id
		secretId: 'xxx',
		secretKey: 'xxx',
		credentials: require('../service/login/tcb_custom_login_key(facei-test-xxx).json'),
	},
	redisConfig: {
		host: 'xxx.com',
		port: '6379',
		password: 'xxx',
	},
};
