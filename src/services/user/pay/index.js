import crypto from 'crypto';
import axios from 'axios'; // 引入 axios 库用于发送 HTTP 请求


// 填写微信支付相关参数
const notifyUrl = 'https://your_domain.com/notify'; // 支付结果通知地址
const wechatPayKey = '4zYh7gkR9oTcL3aP6FbWqXv5iJ2sEdV1'; // 微信支付密钥
const appId = 'wx3e67e2268416075f';
const appSecret = '1d680a99f50a791d44180dac063001d8';

// 处理支付请求的路由
export default async (req, res) => {
  try {
    // 从请求中获取订单信息
    const { orderId, totalFee, spbillCreateIp, userId } = req.body;

    // 调用微信支付统一下单接口获取预支付交易会话标识
    const prepayId = await getPrepayId(
      orderId,
      totalFee,
      spbillCreateIp,
      userId,
      appId,
      appSecret
    );

    // 根据业务逻辑生成微信支付需要的参数
    const timeStamp = '' + Date.now();
    const nonceStr = generateNonceStr(); // 生成随机字符串
    const packageValue = `prepay_id=${prepayId}`;
    const signType = 'MD5'; // 签名类型
    const paySign = generateSign({
      appId,
      timeStamp,
      nonceStr,
      package: packageValue,
      signType,
    });

    // 返回支付参数给小程序端
    res.json({ timeStamp, nonceStr, package: packageValue, signType, paySign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 调用微信支付统一下单接口获取预支付交易会话标识
async function getPrepayId(orderId, totalFee, spbillCreateIp, userId, appId) {
  const url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
  const postData = {
    appid: appId,
    mch_id: '1668713815',
    nonce_str: generateNonceStr(), // 随机字符串
    body: '订单支付', // 商品描述
    out_trade_no: orderId, // 商户订单号
    total_fee: 1, // 订单金额，单位：分
    spbill_create_ip: spbillCreateIp, // 终端IP
    notify_url: notifyUrl, // 支付结果通知地址
    trade_type: 'JSAPI', // 交易类型，小程序支付填 JSAPI
    openid: userId, // 用户在商户 appid 下的唯一标识
  };

  // 生成签名
  postData.sign = generateSign(postData);

  // 将请求参数转换为 XML 格式
  const xmlData = Object.keys(postData)
    .map((key) => `<${key}>${postData[key]}</${key}>`)
    .join('');

  try {
    // 发送 POST 请求到微信支付统一下单接口
    const response = await axios.post(url, xmlData, {
      headers: { 'Content-Type': 'text/xml' },
    });
    console.log('prepay', response);

    // 解析 XML 数据，提取预支付交易会话标识（prepay_id）
    const prepayId = parseXmlResponse(response.data).prepay_id;
    console.log('prepay', prepayId);
    return prepayId;
  } catch (error) {
    throw new Error('Failed to get prepay_id');
  }
}

// 生成随机字符串函数
function generateNonceStr(length = 32) {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let nonceStr = '';
  for (let i = 0; i < length; i++) {
    nonceStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonceStr;
}

// 生成签名函数
function generateSign(params) {
  const stringA = Object.keys(params)
    .filter((key) => params[key])
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  const stringSignTemp = `${stringA}&key=${wechatPayKey}`;
  return crypto
    .createHash('md5')
    .update(stringSignTemp, 'utf8')
    .digest('hex')
    .toUpperCase();
}

// 解析 XML 数据函数
function parseXmlResponse(xmlData) {
  const parser = require('xml2js').Parser({ explicitArray: false });
  let result = {};
  parser.parseString(xmlData, (err, res) => {
    if (err) {
      throw new Error('Failed to parse XML response');
    }
    result = res.xml;
  });
  return result;
}
