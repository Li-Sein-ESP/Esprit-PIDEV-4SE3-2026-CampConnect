#!/bin/bash
# ============================================================
# CampConnect Cluster Reset Script
# Run this if you need to start over
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "============================================================"
echo "   CampConnect Cluster Reset"
echo "============================================================"
echo -e "${NC}"

echo -e "${RED}WARNING: This will completely reset the Kubernetes cluster on this node!${NC}"
echo ""
read -p "Are you sure you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo -e "${YELLOW}Resetting kubeadm...${NC}"
sudo kubeadm reset -f

echo ""
echo -e "${YELLOW}Cleaning up CNI configuration...${NC}"
sudo rm -rf /etc/cni/net.d

echo ""
echo -e "${YELLOW}Removing kubectl config...${NC}"
rm -rf $HOME/.kube

echo ""
echo -e "${YELLOW}Cleaning up iptables...${NC}"
sudo iptables -F
sudo iptables -t nat -F
sudo iptables -t mangle -F
sudo iptables -X

echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}Reset complete!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "You can now run the setup scripts again:"
echo "  - Master: ./master-setup.sh"
echo "  - Worker: ./worker-setup.sh"
echo ""
