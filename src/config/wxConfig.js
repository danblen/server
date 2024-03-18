// 这个文件的改动不提交到仓库
export const wxConfig = {
  appid: process.env.APPID,
  secret: process.env.SECRET,
  grant_type: 'authorization_code',
  url: 'https://api.weixin.qq.com/sns/jscode2session',
  wechatPayKey: process.env.wechatPayKey,
};
