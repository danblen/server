import multer from 'multer';
import path from 'path';

import { CloudBaseRunServer } from './server.js';
import getBanners from './services/image/getBanners/index.js';
import storeImages from './services/image/storeImages/index.js';
import uploadImages from './services/image/uploadImages/index.js';
import queryResult from './services/sd/queryResult/index.js';
import queueProcess from './services/sd/queueProcess/index.js';
import getUserInfo from './services/user/getUserInfo/index.js';
import login from './services/user/login/index.js';

// 创建云托管 Server 实例
const server = new CloudBaseRunServer();

// 注册路由，也就是api接口
const routes = [
	['/login', login],
	['/storeImages', storeImages],
	['/getBanners', getBanners],
	['/getUserInfo', getUserInfo],
	['/queryResult', queryResult],
	['/queueProcess', queueProcess],
	['/uploadImages', uploadImages],
];

routes.forEach(([routePath, module]) => {
	server.setRoute(routePath, module);
});

// // 设置存储图片的目录
// const storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, 'uploads/');
// 	},
// 	filename: function (req, file, cb) {
// 		cb(
// 			null,
// 			file.fieldname + '-' + Date.now() + path.extname(file.originalname)
// 		);
// 	},
// });

// const upload = multer({ storage: storage });

// // 处理文件上传的路由
// server.server.post('/uploadImages', upload.single('file'), (req, res) => {
// 	res.send(req.body);
// });

// 监听端口
server.listen(8080);
