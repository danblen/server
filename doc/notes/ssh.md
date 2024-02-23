生成sshkey复制到服务器可以免密码vscode连接ssh服务器

生成SSH密钥对：
在本地计算机上使用以下命令生成SSH密钥对（如果已经有密钥对，则可以跳过此步骤）：

ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
这将在~/.ssh/目录下生成id_rsa和id_rsa.pub文件。

复制公钥到服务器：
使用以下命令将本地生成的公钥复制到远程服务器上。替换your_username和your_server_ip为实际的用户名和服务器IP地址。

ssh-copy-id your_username@your_server_ip
输入服务器密码确认操作。

在VSCode中设置SSH配置：
打开VSCode，安装并启用"Remote - SSH"插件。然后，点击左下角的绿色远程标志，选择“Remote-SSH: Connect to Host...”并在弹出的输入框中输入：

your_username@your_server_ip
VSCode将连接到服务器，您需要输入密码一次，之后就会保存在VSCode中。

选择SSH密钥：
在VSCode中，按下Ctrl + Shift + P，输入"SSH: Open Configuration File"并选择打开配置文件。在其中添加以下内容：

json
Copy code
Host your_server_ip
    HostName your_server_ip
    User your_username
    IdentityFile ~/.ssh/id_rsa
确保替换your_server_ip和your_username为实际的服务器IP和用户名。

重新连接：
关闭已连接的VSCode窗口，然后重新连接到服务器，这次应该无需输入密码。