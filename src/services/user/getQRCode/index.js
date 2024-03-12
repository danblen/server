import { ENV, STATIC_DIR } from '../../../config/index.js';
import { wxConfig } from '../../../config/wxConfig.js';
import fs from 'fs';
import axios from 'axios';
/**
 * 登录，现在只有微信登录
 * @param event
 * @param context
 */
export default async (req, res) => {
  try {
    const { shareUserId } = req.body;
    // 使用 AppID 和 AppSecret 调用微信接口获取 access_token
    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wxConfig.appid}&secret=${wxConfig.secret}`
    );
    // 提取 access_token 并返回给前端
    const accessToken = response.data.access_token;
    const res = await axios.post(
      'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' +
        accessToken,
      {
        scene: `shareUserId=${shareUserId}&test='34'`, // 传递给后端处理的参数
        page: 'pages/index/index', // 小程序页面路径
        env_version: 'develop',
      },
      {
        responseType: 'arraybuffer',
      }
    );
    const filePath =
      STATIC_DIR +
      '/appstatic/qrcode/' +
      new Date().toISOString().slice(0, 10) +
      '.png';
    const buffer = Buffer.from(res.data);
    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      console.log('File saved successfully at:', filePath);
    });
    const imageUrl = filePath.replace(STATIC_DIR, ENV.URL_STATIC);
    return { data: { imageUrl } };
  } catch (error) {
    console.error('获取 access_token 失败：', error);
  }
};
