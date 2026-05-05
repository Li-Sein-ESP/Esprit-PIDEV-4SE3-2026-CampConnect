#!/bin/bash
# ============================================================
# CampConnect KubeADM Prerequisites
# Run on ALL nodes (master and workers)
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "============================================================"
echo "   CampConnect KubeADM Prerequisites Setup"
echo "   Run this on ALL nodes (master and workers)"
echo "============================================================"
echo -e "${NC}"

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    SUDO=""
else
    SUDO="sudo"
fi

# Step 1: Update system
echo -e "${YELLOW}[1/8] Updating system packages...${NC}"
$SUDO apt-get update
$SUDO apt-get upgrade -y

# Step 2: Disable swap (required for Kubernetes)
echo -e "${YELLOW}[2/8] Disabling swap...${NC}"
$SUDO swapoff -a
# Comment out swap in fstab to persist across reboots
$SUDO sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab 2>/dev/null || true
echo -e "${GREEN}Swap disabled${NC}"

# Step 3: Load required kernel modules
echo -e "${YELLOW}[3/8] Loading kernel modules...${NC}"
cat <<EOF | $SUDO tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
$SUDO modprobe overlay
$SUDO modprobe br_netfilter
echo -e "${GREEN}Kernel modules loaded${NC}"

# Step 4: Set sysctl parameters for Kubernetes networking
echo -e "${YELLOW}[4/8] Configuring sysctl parameters...${NC}"
cat <<EOF | $SUDO tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
$SUDO sysctl --system
echo -e "${GREEN}Sysctl parameters configured${NC}"

# Step 5: Install containerd
echo -e "${YELLOW}[5/8] Installing containerd...${NC}"
$SUDO apt-get install -y containerd
echo -e "${GREEN}Containerd installed${NC}"

# Step 6: Configure containerd for Kubernetes
echo -e "${YELLOW}[6/8] Configuring containerd...${NC}"
$SUDO mkdir -p /etc/containerd
containerd config default | $SUDO tee /etc/containerd/config.toml > /dev/null
$SUDO sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
$SUDO systemctl restart containerd
$SUDO systemctl enable containerd
echo -e "${GREEN}Containerd configured${NC}"

# Step 7: Add Kubernetes apt repository
echo -e "${YELLOW}[7/8] Adding Kubernetes repository...${NC}"
$SUDO apt-get install -y apt-transport-https ca-certificates curl gpg

# Create keyrings directory if it doesn't exist
$SUDO mkdir -p /etc/apt/keyrings

# Download and add the Kubernetes GPG key
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | $SUDO gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg --yes

# Add the Kubernetes repository
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /' | $SUDO tee /etc/apt/sources.list.d/kubernetes.list
echo -e "${GREEN}Kubernetes repository added${NC}"

# Step 8: Install kubeadm, kubelet, kubectl
echo -e "${YELLOW}[8/8] Installing kubeadm, kubelet, kubectl...${NC}"
$SUDO apt-get update
$SUDO apt-get install -y kubelet kubeadm kubectl
$SUDO apt-mark hold kubelet kubeadm kubectl
echo -e "${GREEN}Kubernetes tools installed${NC}"

# Verify installations
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}Prerequisites installed successfully!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo "Installed versions:"
echo -n "  kubeadm: " && kubeadm version -o short
echo -n "  kubelet: " && kubelet --version
echo -n "  kubectl: " && kubectl version --client -o yaml | grep gitVersion | awk '{print $2}'
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  - Master node: Run ./master-setup.sh"
echo "  - Worker nodes: Wait for master to provide join command, then run ./worker-setup.sh"
echo ""
