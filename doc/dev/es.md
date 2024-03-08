Install Elasticsearch:
Download and Install the Public Signing Key:

wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-archive-keyring.gpg
Set Up the APT Repository:

echo "deb [signed-by=/usr/share/keyrings/elasticsearch-archive-keyring.gpg] https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list > /dev/null
Update Package List and Install Elasticsearch:

sudo apt-get update
sudo apt-get install elasticsearch
Start Elasticsearch:
Enable and Start Elasticsearch Service:

sudo systemctl enable elasticsearch
sudo systemctl start elasticsearch
Check Elasticsearch Status:

sudo systemctl status elasticsearch

sudo systemctl stop elasticsearch
如果你想要禁用 Elasticsearch 服务，以防止它在系统启动时自动启动，可以运行以下命令：
sudo systemctl disable elasticsearch