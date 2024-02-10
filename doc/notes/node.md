安装 NVM：

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
该命令会下载并运行 NVM 安装脚本。请注意，你可能需要关闭当前终端窗口，并重新打开一个新的终端窗口，或者执行 source ~/.bashrc 或 source ~/.zshrc，以加载 NVM。

检查 NVM 安装：
nvm --version

安装 Node.js 18.19.0

nvm install 18.19.0
这将下载并安装 Node.js 18.19.0 版本。

启动：
npm start

修改文件自动重启：
nodemon index.js
