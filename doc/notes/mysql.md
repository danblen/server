更新软件包列表：

sudo apt update
安装 MySQL 服务器：

sudo apt install mysql-server
在安装过程中，系统将提示你设置 MySQL root 用户的密码。请记住这个密码，因为你会在之后需要使用它。

启动 MySQL 服务：

sudo systemctl start mysql
设置 MySQL 开机自启：

sudo systemctl enable mysql
检查 MySQL 服务状态：

sudo systemctl status mysql
如果 MySQL 服务正在运行，你将看到状态为 "active (running)"。

进入 MySQL 控制台：

sudo mysql
输入你在安装过程中设置的 MySQL root 用户密码。

创建新用户和数据库（可选）：

在 MySQL 控制台中，你可以创建新的数据库和用户：

CREATE DATABASE your_database_name;
CREATE USER 'your_username'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON your_database_name.* TO 'your_username'@'localhost';
FLUSH PRIVILEGES;
替换 'your_database_name'、'your_username' 和 'your_password' 为你自己的值。

退出 MySQL 控制台：

exit;
防火墙配置（如果需要）：

如果你的服务器上启用了防火墙，你可能需要打开 MySQL 端口（默认为 3306）：

sudo ufw allow 3306
请根据你的防火墙配置调整。


mysql -u root -p
没权限
sudo mysql -u root -p

