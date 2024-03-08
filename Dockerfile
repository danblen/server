# https://hub.docker.com/_/node

# 使用官方 Node.js 镜像作为基础镜像
FROM node:18
# FROM registry.cn-hangzhou.aliyuncs.com/library/node:18
# 设置工作目录
WORKDIR /home/ubuntu/code/dockerapp

# 将本地项目文件复制到容器中
COPY . .

# 安装项目依赖
RUN yarn

# 安装 pm2
RUN npm install pm2 -g

# 暴露应用程序的端口
EXPOSE 8081

# 启动应用程序
CMD ["npm", "start"]

