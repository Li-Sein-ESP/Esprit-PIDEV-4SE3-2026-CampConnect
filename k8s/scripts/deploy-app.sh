#!/bin/bash
# ============================================================
# CampConnect Application Deployment
# Run on MASTER node after all workers have joined
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}"
echo "============================================================"
echo "   CampConnect Application Deployment"
echo "   Run this on the MASTER node"
echo "============================================================"
echo -e "${NC}"

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster.${NC}"
    echo "Make sure you're on the master node and kubectl is configured."
    exit 1
fi

# Step 1: Check cluster status
echo -e "${YELLOW}[1/7] Checking cluster status...${NC}"
echo ""
kubectl get nodes
echo ""

read -p "Are all nodes showing 'Ready'? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Please wait for all nodes to be Ready before deploying.${NC}"
    echo "Run 'kubectl get nodes' to check status."
    exit 1
fi

# Step 2: Create namespace
echo ""
echo -e "${YELLOW}[2/7] Creating namespace...${NC}"
kubectl apply -f "$K8S_DIR/namespace.yaml"
echo -e "${GREEN}Namespace 'campconnect' created${NC}"

# Step 3: Apply ConfigMaps and Secrets
echo ""
echo -e "${YELLOW}[3/7] Applying ConfigMaps and Secrets...${NC}"
kubectl apply -f "$K8S_DIR/configmap.yaml"
kubectl apply -f "$K8S_DIR/secrets.yaml"
echo -e "${GREEN}ConfigMaps and Secrets applied${NC}"

# Step 4: Deploy MongoDB
echo ""
echo -e "${YELLOW}[4/7] Deploying MongoDB...${NC}"
kubectl apply -f "$K8S_DIR/mongodb.yaml"
echo "Waiting for MongoDB to be ready..."
kubectl wait --for=condition=Ready pod -l app=mongodb -n campconnect --timeout=180s || {
    echo -e "${YELLOW}MongoDB taking longer than expected. Continuing...${NC}"
}
echo -e "${GREEN}MongoDB deployed${NC}"

# Step 5: Deploy Backend
echo ""
echo -e "${YELLOW}[5/7] Deploying Backend...${NC}"
kubectl apply -f "$K8S_DIR/backend.yaml"
echo "Waiting for Backend to be ready..."
kubectl wait --for=condition=Available deployment/backend -n campconnect --timeout=300s || {
    echo -e "${YELLOW}Backend taking longer than expected. Continuing...${NC}"
}
echo -e "${GREEN}Backend deployed${NC}"

# Step 6: Deploy Frontend
echo ""
echo -e "${YELLOW}[6/7] Deploying Frontend...${NC}"
kubectl apply -f "$K8S_DIR/frontend.yaml"
echo "Waiting for Frontend to be ready..."
kubectl wait --for=condition=Available deployment/frontend -n campconnect --timeout=180s || {
    echo -e "${YELLOW}Frontend taking longer than expected. Continuing...${NC}"
}
echo -e "${GREEN}Frontend deployed${NC}"

# Step 7: Apply Ingress (optional)
echo ""
echo -e "${YELLOW}[7/7] Applying Ingress...${NC}"
kubectl apply -f "$K8S_DIR/ingress.yaml" || {
    echo -e "${YELLOW}Ingress may require an Ingress Controller. Skipping...${NC}"
}

# Get access information
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

echo -e "${CYAN}Deployed Resources:${NC}"
kubectl get all -n campconnect
echo ""

# Get NodePort information
FRONTEND_PORT=$(kubectl get svc frontend-service -n campconnect -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "N/A")
BACKEND_PORT=$(kubectl get svc backend-service -n campconnect -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "N/A")
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null || hostname -I | awk '{print $1}')

echo -e "${BLUE}============================================================${NC}"
echo -e "${CYAN}ACCESS INFORMATION${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""
echo -e "Node IP: ${GREEN}$NODE_IP${NC}"
echo ""
if [ "$FRONTEND_PORT" != "N/A" ]; then
    echo -e "Frontend URL: ${GREEN}http://$NODE_IP:$FRONTEND_PORT${NC}"
fi
echo ""
echo -e "${CYAN}Alternative: Use Port Forwarding${NC}"
echo "  kubectl port-forward svc/frontend-service 8080:80 -n campconnect"
echo "  Then access: http://localhost:8080"
echo ""
echo -e "${CYAN}View Logs:${NC}"
echo "  kubectl logs -f deployment/backend -n campconnect"
echo "  kubectl logs -f deployment/frontend -n campconnect"
echo ""
echo -e "${CYAN}Check Pod Status:${NC}"
echo "  kubectl get pods -n campconnect -w"
echo ""
