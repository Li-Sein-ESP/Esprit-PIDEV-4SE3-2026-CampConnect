#!/bin/bash
# CampConnect Kubernetes Cleanup Script
# This script removes all CampConnect resources from the cluster

set -e

echo "=== CampConnect Kubernetes Cleanup ==="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Warning: This will delete all CampConnect resources!${NC}"
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Deleting resources..."

# Delete in reverse order of creation
kubectl delete -f monitoring/grafana.yaml --ignore-not-found
kubectl delete -f monitoring/prometheus.yaml --ignore-not-found
kubectl delete -f monitoring/prometheus-config.yaml --ignore-not-found
kubectl delete -f ingress.yaml --ignore-not-found
kubectl delete -f frontend.yaml --ignore-not-found
kubectl delete -f backend.yaml --ignore-not-found
kubectl delete -f mongodb.yaml --ignore-not-found
kubectl delete -f secrets.yaml --ignore-not-found
kubectl delete -f configmap.yaml --ignore-not-found
kubectl delete -f namespace.yaml --ignore-not-found

echo ""
echo -e "${GREEN}Cleanup complete!${NC}"
