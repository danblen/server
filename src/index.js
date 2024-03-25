/**
 * 后台服务入口文件
 * 初始化服务器和定义接口
 */

import multer from 'multer';
import path from 'path';

import { CloudBaseRunServer } from './server.js';
import getBanners from './services/image/getBanners/index.js';
import storeImages from './services/image/storeImages/index.js';
import {
  uploadImages,
  updateImageUserUploadInfo,
} from './services/image/uploadImages/index.js';
import queryResult from './services/sd/queryResult/index.js';
import queueProcess from './services/sd/queueProcess/index.js';
import getUserInfo from './services/user/getUserInfo/index.js';
import login from './services/user/login/index.js';
import getAllImages from './services/image/getAllImages/index.js';
import deleteSelectImages from './services/image/deleteSelectImages/index.js';
import deleteAllImages from './services/image/deleteAllImages/index.js';
import updateUserProcessInfo from './services/image/updateUserProcessInfo/index.js';
import getUserProcessImages from './services/user/getUserProcessImages/index.js';
import addPoints from './services/user/addPoints/index.js';
import checkIn from './services/user/checkIn/index.js';
import updateUserInfo from './services/user/updateUserInfo/index.js';
import { ENV } from './config/index.js';
import { authenticateToken } from './middleware/auth.js';
import pay from './services/user/pay/index.js';
import getQRCode from './services/user/getQRCode/index.js';
import feedback from './services/user/feedback/index.js';
import uploadLaunchInfo from './services/user/uploadLaunchInfo/index.js';

import getTagImages from './services/image/getTagImages/index.js';
import img2img from './services/sd/img2img/index.js';
import txt2img from './services/sd/txt2img/index.js';
import easyPhotoTrainLora from './services/sd/easyPhotoTrainLora/index.js';
import easyPhotoSwapFace from './services/sd/easyPhotoSwapFace/index.js';
import update from './services/image/getImages/update.js';
import getImages from './services/image/getImages/index.js';
import getAppImages from './services/image/getAllImages/getAppImages.js';
import enqueue from './services/sd/enqueue/index.js';
import {
  saveImageToServerApi,
  saveImageToServerInternalApi,
} from './services/common/saveImageToServerApi.js';
// 创建云托管 Server 实例
const server = new CloudBaseRunServer();

// 注册路由，也就是api接口
const routes = [
  ['/login', login],
  ['/storeImages', storeImages],
  ['/getBanners', getBanners],
  ['/getAllImages', getAllImages],
  ['/getUserInfo', getUserInfo],
  ['/addPoints', addPoints],
  ['/checkIn', checkIn],
  ['/getUserProcessImage', getUserProcessImages],
  ['/queryResult', queryResult],
  ['/queueProcess', queueProcess],
  ['/uploadImages', uploadImages],
  ['/getTagImages', getTagImages],
  ['/updateImageUserUploadInfo', updateImageUserUploadInfo],
  ['/deleteSelectImages', deleteSelectImages],
  ['/deleteAllImages', deleteAllImages],
  ['/updateUserProcessInfo', updateUserProcessInfo],
  ['/updateUserInfo', updateUserInfo],
  ['/feedback', feedback],
  ['/uploadLaunchInfo', uploadLaunchInfo],
  ['/getQRCode', getQRCode],
  ['/img2img', img2img],
  ['/txt2img', txt2img],
  ['/update', update],
  ['/enqueue', enqueue],
  ['/saveImageToServerApi', saveImageToServerApi],
  ['/saveImageToServerInternalApi', saveImageToServerInternalApi],
  ['/getAppImages', getAppImages],
  ['/getImages', getImages],
  ['/easyPhotoTrainLora', easyPhotoTrainLora],
  ['/easyPhotoSwapFace', easyPhotoSwapFace],
  ['/pay', pay],
];

routes.forEach(([routePath, module, middleware]) => {
  server.setRoute('post', ENV.API_TYPE + routePath, module, middleware);
});
// server.setRoute('get', '/v1' + 'getAllImages', getAllImages);

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
server.listen(ENV.SERVER_PORT);
