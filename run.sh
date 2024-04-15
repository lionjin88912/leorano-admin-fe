#!/bin/sh


# 登入 AWS 並且取得最新版 image
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin ${1}
docker pull 777582934669.dkr.ecr.ap-northeast-1.amazonaws.com/leorano_admin_fe_stage-master:latest
docker pull 777582934669.dkr.ecr.ap-northeast-1.amazonaws.com/leorano_admin_fe-master:latest
docker-compose down
docker-compose up -d


## 登入 AWS 並且取得最新版 image
#aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin ${1}
#
## 檢查特定容器是否正在運行
#running_container=$(docker ps --filter "ancestor=${1}/${2}" --format "{{.ID}}")
#
#
#if [ ! -z "$running_container" ]; then
#
#  # 停止特定容器
#  docker stop $running_container
#
#  echo "stop"
#fi
#
#
## 啟用 image 並且設定啟用 CPU 跟 RAM
#docker run --cpus=2 --memory=2g -d  -p ${3} ${1}/${2}
#
## 等待 3 秒確認容器是否啟動成功
#sleep 3
#
### 取得最新的容器 ID
##new_container_id=$(docker ps -q)
#
## 取得特定最新容器的IDps
#new_container_id=$(docker ps --filter "ancestor=${1}/${2}" --filter "status=running" --format "{{.ID}}" | head -n 1)
#
#
#if [ ! -z "$new_container_id" ]; then
#  # 刪除其他容器
#  docker container prune -f
#  sleep 1
#  # 刪除其他 image
#  docker image prune -a -f
#else
#  # 如果新容器沒有啟動成功，使用前一個版本啟動容器
#  docker start $running_container
#fi
