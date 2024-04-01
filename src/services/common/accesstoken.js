import axios from 'axios';
import { wxConfig } from '../../config/wxConfig.js';

export async function getAccessToken() {
  const response = await axios.get(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wxConfig.appid}&secret=${wxConfig.secret}`
  );
  return response.data.access_token;
}
