import prisma from "../../../db/prisma.js";
import fs from "fs";
import path from "path"; // 导入path模块

// 确保保存图像的目录存在
const uploadDirectory = "./uploads";
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// 上传图片和保存到数据库
export default async (req) => {
  try {
    const { userId, image, tag } = req.body;

    if (!userId || !image || !tag) {
      throw new Error("Missing required parameters"); // 如果缺少必需参数，则抛出错误
    }

    // 删除 base64 字符串中的前缀
    const base64Data = image[0].replace(/^data:image\/\w+;base64,/, "");
    // 解码 base64 字符串为二进制数据
    const imageData = Buffer.from(base64Data, "base64");
    // 保存到本地文件系统
    const imagePath = path.join(uploadDirectory, `${userId}-${Date.now()}.png`); // 生成文件路径
    fs.writeFileSync(imagePath, imageData); // 将图像数据写入文件
    console.log(imagePath);
    // 保存到数据库
    await prisma.imageUserUpload.create({
      data: {
        userId,
        userPicPath: imagePath,
        contentType: "image/png", // 根据实际情况设置
        tags: "userUpload" + "," + tag,
      },
    });
    return { data: "success" };
  } catch (error) {
    console.error("Error saving image to local filesystem:", error); // 打印错误信息到控制台
    return { error: error.message }; // 返回包含错误信息的对象
  } finally {
    await prisma.$disconnect(); // 关闭数据库连接
  }
};
