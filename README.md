# 安装工具

需要先安装 node 16.14 版本以上

### 安装 yarn

npm i -g yarn

### 安装依赖

yarn

### 启动后台服务：
启动项目首先要添加.env 文件
开发环境启动
yarn dev

生产环境启动
yarn start
### 使用 tmux 启动服务

创建会话
tmux

在新的 seesion 会话中启动服务
yarn dev

连接上次 tmux session

tmux attach-session

# 数据库：

### 创建数据库：

在终端中运行以下命令，创建 SQLite 数据库文件：

npx prisma db push

### 生成 Prisma Client：

npx prisma generate

如果有修改 prisma/schema.prisma 文件需要重新运行这两个命令迁移数据库
npx prisma db push
npx prisma generate

### 使用 Prisma Client：

在后台服务中，通过 Prisma Client 来执行数据库操作。例如：

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

# 备注

文件引用要写全扩展名 xxx.js

import { wxConfig } from '../../../config/wxConfig.js';

不写全扩展名会报错

import { wxConfig } from '../../../config/wxConfig';
