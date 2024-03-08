### 构建镜像

要构建 Docker 镜像，您可以使用以下步骤：

创建 Dockerfile： 在您的项目根目录创建一个名为 Dockerfile 的文件，其中包含您的构建配置。在您的示例中，已经有了一个 Dockerfile。

编写 Dockerfile： 打开 Dockerfile 文件，确保其中的内容符合您的项目需求。在这个例子中，Dockerfile 中已经包含了使用 Node.js 镜像、设置工作目录、复制项目文件、安装依赖、安装 PM2、暴露端口以及启动应用程序的步骤。

在项目目录下执行构建命令： 打开终端，切换到包含 Dockerfile 的项目目录，然后执行以下构建命令：

docker build -t my-node-app .
-t 参数用于为构建的镜像设置一个标签（例如 my-node-app）。
. 表示当前目录，告诉 Docker 在当前目录查找 Dockerfile。
等待构建完成： Docker 将按照 Dockerfile 中的指令执行构建过程。这可能需要一些时间，具体取决于项目的大小和依赖项。

查看构建的镜像： 构建完成后，您可以使用以下命令查看构建的镜像列表：

docker images
如果一切顺利，您将在列表中看到包含标签为 my-node-app 的新镜像。

现在，您已经成功构建了一个基于 Node.js 的 Docker 镜像。可以使用这个镜像运行容器，并在容器中执行您的应用程序。例如：

docker run -p 8081:8081 my-node-app
这将启动一个容器，将容器的 8081 端口映射到主机的 8081 端口，并运行您的 Node.js 应用程序。



换源  /etc/docker/daemon.json
{
  "registry-mirrors": ["https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors"]
}




### 启动docker
Docker 守护进程运行： 确保 Docker 守护进程正在运行。您可以使用以下命令检查 Docker 服务的状态：

sudo systemctl status docker
如果 Docker 守护进程未运行，可以使用以下命令启动它：

sudo systemctl start docker
重新启动 Docker 守护进程： 如果您的 Docker 守护进程已经在运行，但您仍然无法连接，可以尝试重新启动 Docker 服务：

sudo systemctl restart docker
检查 Docker Socket 权限： 确保 Docker Socket 的权限正确。运行以下命令检查 /var/run/docker.sock 文件的权限：

ls -l /var/run/docker.sock
确保输出中包含 docker 组。


### 添加权限
1. 将用户添加到 Docker 组
打开终端并运行以下命令，将当前用户添加到 Docker 组：


sudo usermod -aG docker $USER
然后注销并重新登录，以确保组的更改生效。

2. 更改 Docker 守护进程的权限
确保 /var/run/docker.sock 的权限正确，可以运行：


ls -l /var/run/docker.sock
您应该看到像 srw-rw---- 1 root docker 这样的输出。

如果权限不正确，可以运行以下命令更改它：


sudo chown $USER:docker /var/run/docker.sock
3. 重新构建 Docker 镜像
重新运行您的 Docker 镜像构建命令：


docker build -t my-node-app .
如果一切设置正确，您现在应该能够成功构建 Docker 镜像。

请注意，可能需要使用 sudo 来运行 Docker 命令，如果您未将用户添加到 Docker 组。在这种情况下，命令会是：


sudo docker build -t my-node-app .
请确保您的用户有足够的权限，以便正常使用 Docker。

### 删除docker镜像
要删除 Docker 镜像，您可以使用 docker rmi 命令。以下是基本的语法：

docker rmi [OPTIONS] IMAGE [IMAGE...]
其中，IMAGE 是要删除的镜像的名称或ID。下面是一些常见的用法：

删除单个镜像：

docker rmi image_name_or_id
删除多个镜像：

docker rmi image1_name_or_id image2_name_or_id ...
删除所有未使用的镜像：

docker image prune
上述命令将删除所有未被任何容器引用的镜像。

强制删除镜像，即使有容器正在使用：

docker rmi -f image_name_or_id
请小心使用 -f 选项，因为它将终止正在运行的容器并删除相关的镜像。