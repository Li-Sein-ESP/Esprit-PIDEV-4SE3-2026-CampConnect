#!/bin/bash
# ============================================================
# CampConnect Monitoring Stack Deployment
# Run on MASTER node after main application is deployed
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
MONITORING_DIR="$K8S_DIR/monitoring"

echo -e "${BLUE}"
echo "============================================================"
echo "   CampConnect Monitoring Stack Deployment"
echo "   (Prometheus + Grafana)"
echo "============================================================"
echo -e "${NC}"

# Check if monitoring directory exists
if [ ! -d "$MONITORING_DIR" ]; then
    echo -e "${RED}Error: Monitoring directory not found at $MONITORING_DIR${NC}"
    exit 1
fi

# Deploy Prometheus
echo -e "${YELLOW}[1/3] Deploying Prometheus...${NC}"
kubectl apply -f "$MONITORING_DIR/prometheus-config.yaml"
kubectl apply -f "$MONITORING_DIR/prometheus.yaml"
echo -e "${GREEN}Prometheus deployed${NC}"

# Deploy Grafana
echo ""
echo -e "${YELLOW}[2/3] Deploying Grafana...${NC}"
kubectl apply -f "$MONITORING_DIR/grafana.yaml"
echo -e "${GREEN}Grafana deployed${NC}"

# Wait for deployments
echo ""
echo -e "${YELLOW}[3/3] Waiting for monitoring stack to be ready...${NC}"
kubectl wait --for=condition=Available deployment/prometheus -n campconnect --timeout=180s || {
    echo -e "${YELLOW}Prometheus taking longer than expected.${NC}"
}
kubectl wait --for=condition=Available deployment/grafana -n campconnect --timeout=180s || {
    echo -e "${YELLOW}Grafana taking longer than expected.${NC}"
}

# Get access information
echo ""
echo -e "${BLUE}============================================================${NC}"
echo -e "${GREEN}MONITORING STACK DEPLOYED!${NC}"
echo -e "${BLUE}============================================================${NC}"
echo ""

PROMETHEUS_PORT=$(kubectl get svc prometheus-service -n campconnect -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "N/A")
GRAFANA_PORT=$(kubectl get svc grafana-service -n campconnect -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "N/A")
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null || hostname -I | awk '{print $1}')

echo -e "${CYAN}Access URLs:${NC}"
echo -e "  Prometheus: ${GREEN}http://$NODE_IP:$PROMETHEUS_PORT${NC}"
echo -e "  Grafana:    ${GREEN}http://$NODE_IP:$GRAFANA_PORT${NC}"
echo ""
echo -e "${CYAN}Grafana Credentials:${NC}"
echo -e "  Username: ${GREEN}admin${NC}"
echo -e "  Password: ${GREEN}campconnect123${NC}"
echo ""
echo -e "${CYAN}Port Forwarding Alternative:${NC}"
echo "  kubectl port-forward svc/prometheus-service 9090:9090 -n campconnect"
echo "  kubectl port-forward svc/grafana-service 3000:3000 -n campconnect"
echo ""
