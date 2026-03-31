#!/bin/bash
# ============================================================
# CampConnect KubeADM Worker Node Setup
# Run on WORKER nodes only (after master is ready)
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "============================================================"
echo "   CampConnect KubeADM Worker Node Setup"
echo "   Run this on WORKER nodes only"
echo "============================================================"
echo -e "${NC}"

# Check if kubeadm is installed
if ! command -v kubeadm &> /dev/null; then
    echo -e "${RED}Error: kubeadm is not installed. Run prerequisites.sh first.${NC}"
    exit 1
fi

# Check if join command is provided as argument
if [ -z "$1" ]; then
    echo -e "${YELLOW}No join command provided as argument.${NC}"
    echo ""
    echo "You can either:"
    echo "  1. Paste the join command when prompted"
    echo "  2. Run again with: ./worker-setup.sh '<join-command>'"
    echo ""
    echo -e "${CYAN}Enter the join command from the master node:${NC}"
    echo "(It looks like: sudo kubeadm join 192.168.x.x:6443 --token xxx --discovery-token-ca-cert-hash sha256:xxx)"
    echo ""
    read -p "> " JOIN_COMMAND
else
    JOIN_COMMAND="$1"
fi

# Validate join command
if [[ ! "$JOIN_COMMAND" =~ "kubeadm join" ]]; then
    echo -e "${RED}Error: Invalid join command. It should contain 'kubeadm join'.${NC}"
    exit 1
fi

# Ensure it starts with sudo
if [[ ! "$JOIN_COMMAND" =~ ^sudo ]]; then
    JOIN_COMMAND="sudo $JOIN_COMMAND"
fi

echo ""
echo -e "${YELLOW}Joining cluster with command:${NC}"
echo "$JOIN_COMMAND"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Execute the join command
echo ""
echo -e "${YELLOW}Joining the cluster...${NC}"
eval $JOIN_COMMAND

echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}WORKER NODE SETUP COMPLETE!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo "This node should now be part of the cluster."
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  - Ask the master node operator to verify with: kubectl get nodes"
echo "  - This node should appear in the list as 'Ready' within a minute"
echo ""
