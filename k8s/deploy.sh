#!/bin/bash
# CampConnect Kubernetes Deployment Script for KubeADM
# This script deploys the entire CampConnect stack to a KubeADM cluster

set -e

echo "=== CampConnect Kubernetes Deployment ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

# Check cluster connectivity
echo "Checking cluster connectivity..."
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
    echo "Make sure your kubeconfig is properly configured"
    exit 1
fi
echo -e "${GREEN}Cluster connection OK${NC}"
echo ""

# Function to wait for deployment
wait_for_deployment() {
    local deployment=$1
    local namespace=$2
    echo "Waiting for $deployment to be ready..."
    kubectl rollout status deployment/$deployment -n $namespace --timeout=300s
}

# Step 1: Create namespace
echo "Step 1: Creating namespace..."
kubectl apply -f namespace.yaml
echo -e "${GREEN}Namespace created${NC}"
echo ""

# Step 2: Apply ConfigMaps and Secrets
echo "Step 2: Applying ConfigMaps and Secrets..."
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
echo -e "${GREEN}ConfigMaps and Secrets applied${NC}"
echo ""

# Step 3: Deploy MongoDB
echo "Step 3: Deploying MongoDB..."
kubectl apply -f mongodb.yaml
wait_for_deployment "mongodb" "campconnect"
echo -e "${GREEN}MongoDB deployed${NC}"
echo ""

# Step 4: Deploy Backend
echo "Step 4: Deploying Backend..."
kubectl apply -f backend.yaml
wait_for_deployment "backend" "campconnect"
echo -e "${GREEN}Backend deployed${NC}"
echo ""

# Step 5: Deploy Frontend
echo "Step 5: Deploying Frontend..."
kubectl apply -f frontend.yaml
wait_for_deployment "frontend" "campconnect"
echo -e "${GREEN}Frontend deployed${NC}"
echo ""

# Step 6: Apply Ingress (optional)
echo "Step 6: Applying Ingress..."
kubectl apply -f ingress.yaml
echo -e "${GREEN}Ingress applied${NC}"
echo ""

# Step 7: Deploy Monitoring Stack
echo "Step 7: Deploying Monitoring Stack..."
kubectl apply -f monitoring/prometheus-config.yaml
kubectl apply -f monitoring/prometheus.yaml
kubectl apply -f monitoring/grafana.yaml
wait_for_deployment "prometheus" "campconnect"
wait_for_deployment "grafana" "campconnect"
echo -e "${GREEN}Monitoring stack deployed${NC}"
echo ""

# Display results
echo "=== Deployment Complete ==="
echo ""
echo "Deployed resources:"
kubectl get all -n campconnect
echo ""

# Get NodePort for services
echo "=== Access Information ==="
FRONTEND_PORT=$(kubectl get svc frontend-service -n campconnect -o jsonpath='{.spec.ports[0].nodePort}')
PROMETHEUS_PORT=$(kubectl get svc prometheus-service -n campconnect -o jsonpath='{.spec.ports[0].nodePort}')
GRAFANA_PORT=$(kubectl get svc grafana-service -n campconnect -o jsonpath='{.spec.ports[0].nodePort}')
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')

echo -e "Frontend:   ${GREEN}http://${NODE_IP}:${FRONTEND_PORT}${NC}"
echo -e "Prometheus: ${GREEN}http://${NODE_IP}:${PROMETHEUS_PORT}${NC}"
echo -e "Grafana:    ${GREEN}http://${NODE_IP}:${GRAFANA_PORT}${NC}"
echo ""
echo -e "${YELLOW}Grafana Credentials:${NC}"
echo "  Username: admin"
echo "  Password: campconnect123"
echo ""
echo -e "${GREEN}Deployment successful!${NC}"
