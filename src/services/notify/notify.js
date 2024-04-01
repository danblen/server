// const { Wechaty } = require('wechaty');
// const { WechatyPuppetWechat4u } = require('wechaty-puppet-wechat4u');
// const { PuppetPadplus } = require('wechaty-puppet-padplus');

import { Wechaty } from 'wechaty';
import { WechatyPuppetWechat4u } from 'wechaty-puppet-wechat4u';
import { PuppetPadplus } from 'wechaty-puppet-padplus';
// 创建 Wechaty 实例
const bot = new Wechaty({
  puppet: new WechatyPuppetWechat4u(),
});

// 监听消息
bot.on('message', async (message) => {
  // 判断是否为任务完成的通知消息
  if (message.text() === '任务完成') {
    // 发送公众号消息
    await sendPublicMessage('用户任务已完成！');
  }
});

// 发送公众号消息函数
async function sendPublicMessage(message) {
  // 创建 Padplus puppet
  const puppet = new PuppetPadplus();

  // 登录公众号
  await puppet.start();
  await puppet.login(); // 使用你的微信公众号账号登录

  // 发送消息
  await puppet.messageSendPublicText('公众号用户名', message); // 用你的公众号用户名替换 '公众号用户名'

  // 登出
  await puppet.stop();
}

// 启动 Wechaty
bot.start();
export default bot;
