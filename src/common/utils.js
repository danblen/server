export function generateUniqueId() {
  const timestamp = new Date().getTime(); // 获取当前时间戳
  const random = Math.floor(Math.random() * 10000); // 生成0到9999之间的随机数
  const uniqueId = timestamp.toString() + random.toString(); // 将时间戳和随机数拼接成唯一ID
  return uniqueId;
}
