安装 PM2：
使用 npm 全局安装 PM2：

npm install -g pm2
启动应用程序：
在你的项目目录中执行以下命令来启动应用程序（假设你的入口文件为 app.js，你可以根据实际情况修改）：

pm2 start app.js
管理应用程序：
一旦应用程序启动，你可以使用 PM2 来管理它，例如：

查看运行中的应用程序：

pm2 list
停止应用程序：

pm2 stop <app_name_or_id>
重启应用程序：


pm2 restart <app_name_or_id>
查看应用程序的日志：


pm2 logs <app_name_or_id>
更多命令和选项，请查阅 PM2 官方文档：PM2 CLI

配置和自定义：
你可以使用 PM2 配置文件来自定义启动参数和其他设置。创建一个名为 ecosystem.config.js 的文件，例如：

javascript
Copy code
module.exports = {
  apps: [
    {
      name: 'my-app',
      script: 'app.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
然后使用以下命令启动应用程序：


pm2 start ecosystem.config.js