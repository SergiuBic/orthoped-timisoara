#!/usr/bin/env bash
# One-time setup for Oracle Cloud Always Free Ubuntu 24.04 (arm64). Run as the ubuntu user.
set -euo pipefail
sudo apt-get update && sudo DEBIAN_FRONTEND=noninteractive apt-get -y upgrade
sudo apt-get -y install ca-certificates curl git fail2ban unattended-upgrades netfilter-persistent
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
# Oracle images block 80/443 in iptables even when the VCN security list allows them.
for p in "tcp 80" "tcp 443" "udp 443"; do
  set -- $p
  sudo iptables -C INPUT -p "$1" --dport "$2" -m state --state NEW -j ACCEPT 2>/dev/null ||
    sudo iptables -I INPUT 6 -p "$1" --dport "$2" -m state --state NEW -j ACCEPT
done
sudo netfilter-persistent save
if [ ! -f /swapfile ]; then
  sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi
( crontab -l 2>/dev/null | grep -v ortoped-backup; echo "0 2 * * * cd $HOME/ortoped && ./infra/backup.sh >> $HOME/ortoped-backup.log 2>&1" ) | crontab -
echo "Done. Log out and back in (docker group), then: cd ~/ortoped && docker compose up -d --build"
