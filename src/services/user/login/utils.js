import { v4 as uuid } from 'uuid';

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { wxConfig } from '../../../config/wxConfig.js';
import { JWT_SECRET_KEY } from '../../../config/index.js';
export const generateToken = (user) => {
  // 生成 JWT Token
  const token = jwt.sign(
    { openid: user.openid, userId: user.userId },
    JWT_SECRET_KEY,
    { expiresIn: '1h' }
  );
  return token;
};

export const generateUserId = () => {
  return uuid().slice(0, 8);
};

export const getWXOpenId = async (reqBody) => {
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
  return openid;
};
