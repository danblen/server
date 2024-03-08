#!/bin/bash

threshold=90
log_file="cpu_monitor.log"
while true; do
  echo "start loop" >> "$log_file"
  cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F. '{print $1}')
  
  if [ "$cpu_usage" -gt "$threshold" ]; then
    echo "$(date): High CPU usage detected! Terminating process..." >> "$log_file"
    # 获取占用 CPU 最高的进程 ID
    pid=$(ps -eo pid,%cpu --sort=-%cpu | awk 'NR==2 {print $1}')
    # 终止进程
    kill -15 "$pid"
    echo "$(date): Process $pid terminated." >> "$log_file"
  fi

  sleep 10
done
