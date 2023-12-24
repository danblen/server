/**
 * 获取当前环境的配置
 */
let config;

if (process.env.NODE_ENV === 'local') {
	config = require('../config/config.local');
} else {
	config = require('../config/config');
}

module.exports = config;
