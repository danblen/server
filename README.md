# 安装工具

需要先安装 node

### 安装 yarn

npm i -g yarn

### 安装依赖

yarn

### 启动后台服务：

npm run start:dev

# 数据库：

### 创建数据库：

在终端中运行以下命令，创建 SQLite 数据库文件：

npx prisma db push

### 生成 Prisma Client：

npx prisma generate

### 使用 Prisma Client：

在你的应用程序中，通过 Prisma Client 来执行数据库操作。例如：

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

# 备注

文件引用要写全扩展名 xxx.js

import { wxConfig } from '../../../config/wxConfig.js';

不写全扩展名会报错

import { wxConfig } from '../../../config/wxConfig';
