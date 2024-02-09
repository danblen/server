import prisma from "../../../db/prisma.js";
import fs from "fs";
import path from "path";

const uploadDirectory = "/home/ubuntu/code/server/uploads"; // 定义绝对路径

// 如果目录不存在，则创建目录
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

export default async (req) => {
  try {
    const { userId, image, tag, description } = req.body;

    // 检查必需的参数是否存在且为数组
    if (!userId || !image || !Array.isArray(image) || !tag || !description) {
      throw new Error("Missing required parameters or image is not an array");
    }

    const imagePaths = []; // 用于保存图片路径的数组

    // 遍历上传的所有图片数据
    image.forEach((image, index) => {
      if (!image) return;
      // 删除 base64 字符串中的前缀
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      // 解码 base64 字符串为二进制数据
      const imageData = Buffer.from(base64Data, "base64");
      // 生成文件路径，使用描述作为文件名
      const imagePath = path.join(
        uploadDirectory,
        `${description}-${index + 1}.png`
      );
      // 将图像数据写入文件
      fs.writeFileSync(imagePath, imageData);
      console.log(`Image ${index + 1} saved as:`, imagePath);
      // 将图片路径添加到数组中
      imagePaths.push(imagePath);
    });

    // 保存到数据库
    for (const imagePath of imagePaths) {
      await prisma.imageUserUpload.create({
        data: {
          userId,
          description: description,
          userPicPath: imagePath,
          contentType: "image/png", // 根据实际情况设置
          tags: tag, // 将标签放入数组中
        },
      });
    }

    return { data: "success" };
  } catch (error) {
    // 处理错误信息
    console.error("Error saving image to local filesystem:", error);
    return { error: error.message };
  } finally {
    // 关闭数据库连接等操作
    await prisma.$disconnect();
  }
};
