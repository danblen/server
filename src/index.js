const { CloudBaseRunServer } = require('./server');

// 创建云托管 Server 实例
const server = new CloudBaseRunServer();

// 注册路由
// 登录
server.setRoute('/login', require('./service/login/index.js').main);
server.setRoute('/logout', require('./service/logout/index.js').main);

// 监听端口
server.listen(7592);
