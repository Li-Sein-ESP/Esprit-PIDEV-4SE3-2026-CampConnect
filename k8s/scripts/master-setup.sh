#!/bin/bash
# ============================================================
# CampConnect KubeADM Master Node Setup
# Run ONLY on the MASTER node (after prerequisites.sh)
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "============================================================"
echo "   CampConnect KubeADM Master Node Setup"
echo "   Run this ONLY on the MASTER node"
echo "============================================================"
echo -e "${NC}"

# Check if kubeadm is installed
if ! command -v kubeadm &> /dev/null; then
    echo -e "${RED}Error: kubeadm is not installed. Run prerequisites.sh first.${NC}"
    exit 1
fi

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    SUDO=""
else
    SUDO="sudo"
fi

# Get the WSL2/machine IP address
echo -e "${YELLOW}[1/5] Detecting IP address...${NC}"
MASTER_IP=$(hostname -I | awk '{print $1}')

if [ -z "$MASTER_IP" ]; then
    echo -e "${RED}Error: Could not detect IP address${NC}"
    echo "Please enter your machine's IP address manually:"
    read -p "IP Address: " MASTER_IP
fi

echo -e "${GREEN}Master IP: $MASTER_IP${NC}"
echo ""

# Confirm before proceeding
echo -e "${YELLOW}This will initialize a Kubernetes cluster with this machine as the master.${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Step 2: Initialize the Kubernetes cluster
echo ""
echo -e "${YELLOW}[2/5] Initializing Kubernetes cluster...${NC}"
echo "This may take a few minutes..."
echo ""

$SUDO kubeadm init \
    --pod-network-cidr=10.244.0.0/16 \
    --apiserver-advertise-address=$MASTER_IP \
    --control-plane-endpoint=$MASTER_IP:6443

# Step 3: Set up kubectl config for current user
echo ""
echo -e "${YELLOW}[3/5] Setting up kubectl config...${NC}"
mkdir -p $HOME/.kube
$SUDO cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
$SUDO chown $(id -u):$(id -g) $HOME/.kube/config
echo -e "${GREEN}kubectl configured${NC}"

# Step 4: Install Flannel CNI (Pod Network)
echo ""
echo -e "${YELLOW}[4/5] Installing Flannel network plugin...${NC}"
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
echo -e "${GREEN}Flannel installed${NC}"

# Step 5: Generate and save join command for workers
echo ""
echo -e "${YELLOW}[5/5] Generating worker join command...${NC}"
JOIN_COMMAND=$($SUDO kubeadm token create --print-join-command)

# Save join command to file
JOIN_FILE="$HOME/worker-join-command.txt"
echo "sudo $JOIN_COMMAND" > "$JOIN_FILE"

# Wait for node to be ready
echo ""
echo -e "${YELLOW}Waiting for master node to be ready...${NC}"
sleep 10

# Check node status
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}MASTER NODE SETUP COMPLETE!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "${CYAN}Master IP Address:${NC} $MASTER_IP"
echo ""
echo -e "${CYAN}Cluster Status:${NC}"
kubectl get nodes
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${YELLOW}IMPORTANT: SHARE THIS WITH YOUR TEAMMATES${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "${CYAN}Worker Join Command:${NC}"
echo -e "${GREEN}------------------------------------------------------------${NC}"
echo -e "${GREEN}sudo $JOIN_COMMAND${NC}"
echo -e "${GREEN}------------------------------------------------------------${NC}"
echo ""
echo -e "Join command saved to: ${CYAN}$JOIN_FILE${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Share the join command above with all worker nodes"
echo "  2. Workers run: ./worker-setup.sh '<join-command>'"
echo "  3. Verify all nodes joined: kubectl get nodes"
echo "  4. Deploy the app: ./deploy-app.sh"
echo ""
