import axios from 'axios';
import { getAccessToken } from '../common/accesstoken.js';
export const tasktmpId = 'yI6xwoMfz8rcuHI5NpC3IO_d3Ge2a-Pya8O4-EK-qtw';
export async function pushMsg({ openid, templateId, data }) {
  let ACCESS_TOKEN = await getAccessToken();
  // 准备发送模板消息的数据
  const messageData = {
    touser: openid, // 用户的OpenID，需要提前获取
    template_id: templateId || tasktmpId, // 模板消息的ID，需要在公众号后台创建模板消息获取
    data,
  };
  // 准备发送模板消息的请求配置
  const requestOptions = {
    method: 'POST',
    url: `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${ACCESS_TOKEN}`,
    data: messageData,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  // 发送模板消息
  axios(requestOptions)
    .then((response) => {
      console.log('模板消息发送成功', response.data);
    })
    .catch((error) => {
      console.error('模板消息发送失败', error);
    });
}
