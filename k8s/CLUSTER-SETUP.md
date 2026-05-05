# CampConnect KubeADM Cluster Setup Guide

## Overview

This guide sets up a multi-node Kubernetes cluster using **KubeADM** with:
- **1 Master Node** (Control Plane) - Your machine
- **5 Worker Nodes** - Teammates' machines

All machines: **Windows + WSL2**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CampConnect KubeADM Cluster                  │
│                                                                 │
│  ┌─────────────────┐                                            │
│  │  MASTER (You)   │  Control Plane                             │
│  │  - API Server   │  Runs: kubeadm, kubectl                    │
│  │  - Scheduler    │                                            │
│  │  - etcd         │                                            │
│  └────────┬────────┘                                            │
│           │                                                     │
│   ┌───────┴───────┬───────────┬───────────┬───────────┐         │
│   │               │           │           │           │         │
│ ┌─▼─┐   ┌─▼─┐   ┌─▼─┐   ┌─▼─┐   ┌─▼─┐                          │
│ │W1 │   │W2 │   │W3 │   │W4 │   │W5 │  Worker Nodes             │
│ └───┘   └───┘   └───┘   └───┘   └───┘  (Run pods)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### All Machines Need:
- Windows 10/11 with WSL2 enabled
- Ubuntu in WSL2 (recommended: Ubuntu 22.04)
- At least 4GB RAM allocated to WSL2
- Internet connectivity
- Same local network (can ping each other)

### Required Ports (Firewall)

**Master Node (open these ports):**
| Port | Protocol | Purpose |
|------|----------|---------|
| 6443 | TCP | Kubernetes API server |
| 2379-2380 | TCP | etcd server client API |
| 10250 | TCP | Kubelet API |
| 10259 | TCP | kube-scheduler |
| 10257 | TCP | kube-controller-manager |

**Worker Nodes (open these ports):**
| Port | Protocol | Purpose |
|------|----------|---------|
| 10250 | TCP | Kubelet API |
| 30000-32767 | TCP | NodePort Services |

---

## Quick Start Summary

| Step | Who | Command |
|------|-----|---------|
| 0 | ALL | Configure WSL2 networking (see Phase 0 below) |
| 1 | ALL | `./prerequisites.sh` |
| 2 | MASTER only | `./master-setup.sh` |
| 3 | WORKERS only | `./worker-setup.sh '<join-command>'` |
| 4 | MASTER only | `./deploy-app.sh` |
| 5 | MASTER only | `./deploy-monitoring.sh` (optional) |

---

## PHASE 0: Network Configuration (BEFORE Everything Else)

> **CRITICAL:** Complete this phase on ALL machines before proceeding!

### Why This Matters

By default, WSL2 uses NAT networking, which means:
- Your WSL2 instance has an internal IP (like `172.x.x.x`)
- **Other machines CANNOT reach your WSL2 directly**
- Kubernetes nodes won't be able to communicate

We need to fix this FIRST, or the cluster setup will fail.

### Option A: Mirrored Mode (Recommended for Windows 11)

This is the easiest solution. It makes WSL2 share your Windows IP address.

**Step 1:** Create/edit the file `C:\Users\<YourName>\.wslconfig`

**Step 2:** Add these lines:
```ini
[wsl2]
networkingMode=mirrored
```

**Step 3:** Restart WSL2:
```powershell
wsl --shutdown
```

**Step 4:** Verify (in WSL2):
```bash
hostname -I
```
This should now show your Windows IP (like `192.168.1.50`), not an internal IP.

### Option B: Port Forwarding (Alternative)

If mirrored mode doesn't work, use our automated script:

**Step 1:** Open PowerShell as Administrator

**Step 2:** Navigate to the project:
```powershell
cd C:\Users\YourName\Desktop\PI\ConnectCamp\k8s\scripts
```

**Step 3:** Run the setup script:
```powershell
.\setup-port-forwarding.ps1
```

**Step 4:** Select your role (Master=1, Worker=2)

### Firewall Configuration

Even with networking configured, Windows Firewall must allow Kubernetes traffic.

**Run in PowerShell as Administrator:**
```powershell
# Allow Kubernetes API (Master only)
New-NetFirewallRule -DisplayName "Kubernetes API Server" -Direction Inbound -Protocol TCP -LocalPort 6443 -Action Allow

# Allow Kubelet (All nodes)
New-NetFirewallRule -DisplayName "Kubernetes Kubelet" -Direction Inbound -Protocol TCP -LocalPort 10250 -Action Allow

# Allow NodePort Services (All nodes)
New-NetFirewallRule -DisplayName "Kubernetes NodePort Services" -Direction Inbound -Protocol TCP -LocalPort 30000-32767 -Action Allow
```

### Verify Connectivity

Before proceeding, test that machines can reach each other:

**Step 1:** Find your Windows IP:
```powershell
ipconfig
```

**Step 2:** Share IPs with team and test ping:
```powershell
ping <teammate-ip>
```

### Phase 0 Checklist

- [ ] WSL2 networking configured (mirrored mode OR port forwarding)
- [ ] Windows Firewall rules created
- [ ] Can ping all team members' machines
- [ ] All team members know their Windows IP addresses

**For detailed instructions, see: [WSL2-NETWORKING.md](./WSL2-NETWORKING.md)**

---

## Detailed Setup Instructions

### PHASE 1: Preparation (Master - Tonight)

#### Step 1.1: Get the Project Files

Make sure all teammates have access to the project:
```bash
# Clone the repository (or copy files)
git clone <your-repo-url>
cd ConnectCamp
```

#### Step 1.2: Push Docker Images to Docker Hub

**On your machine (master), run:**

```bash
# 1. Login to Docker Hub
docker login
# Enter your Docker Hub username and password

# 2. Build the images (if not already built)
cd /mnt/c/Users/houst/Desktop/PI/ConnectCamp
docker compose build

# 3. Tag images for Docker Hub
# Replace YOUR_DOCKERHUB_USERNAME with your actual username
docker tag connectcamp-backend:latest YOUR_DOCKERHUB_USERNAME/campconnect-backend:latest
docker tag connectcamp-frontend:latest YOUR_DOCKERHUB_USERNAME/campconnect-frontend:latest

# 4. Push images to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/campconnect-backend:latest
docker push YOUR_DOCKERHUB_USERNAME/campconnect-frontend:latest
```

#### Step 1.3: Update Kubernetes Manifests

Edit the image names in these files to match your Docker Hub username:

**File: `k8s/backend.yaml` (line ~42)**
```yaml
image: YOUR_DOCKERHUB_USERNAME/campconnect-backend:latest
```

**File: `k8s/frontend.yaml` (line ~23)**
```yaml
image: YOUR_DOCKERHUB_USERNAME/campconnect-frontend:latest
```

---

### PHASE 2: Setup Day (Tomorrow - With Teammates)

#### Step 2.1: Prerequisites (ALL NODES)

**Every machine** (master and all workers) must run:

```bash
# Navigate to the project
cd /mnt/c/Users/YOUR_USERNAME/Desktop/PI/ConnectCamp/k8s/scripts

# Make scripts executable
chmod +x *.sh

# Run prerequisites
./prerequisites.sh
```

**This installs:**
- containerd (container runtime)
- kubeadm (cluster bootstrapping)
- kubelet (node agent)
- kubectl (CLI tool)

**Expected time:** 5-10 minutes per machine

#### Step 2.2: Initialize Master Node (MASTER ONLY)

**On YOUR machine only:**

```bash
./master-setup.sh
```

**What happens:**
1. Detects your IP address
2. Initializes Kubernetes cluster
3. Installs Flannel (pod networking)
4. Generates a **join command** for workers

**IMPORTANT:** After completion, you'll see output like:
```
Worker Join Command:
------------------------------------------------------------
sudo kubeadm join 192.168.1.100:6443 --token abc123.xyz789 \
    --discovery-token-ca-cert-hash sha256:abcdef123456...
------------------------------------------------------------
```

**Save this command!** You need to share it with all teammates.

#### Step 2.3: Join Worker Nodes (WORKERS ONLY)

**On each teammate's machine:**

```bash
# Option A: Pass the join command as argument
./worker-setup.sh "sudo kubeadm join 192.168.1.100:6443 --token abc123 --discovery-token-ca-cert-hash sha256:xyz"

# Option B: Run without argument and paste when prompted
./worker-setup.sh
```

**Repeat for all 5 worker nodes.**

#### Step 2.4: Verify Cluster (MASTER ONLY)

**On your machine, verify all nodes joined:**

```bash
kubectl get nodes
```

**Expected output:**
```
NAME      STATUS   ROLES           AGE   VERSION
master    Ready    control-plane   10m   v1.29.x
worker1   Ready    <none>          5m    v1.29.x
worker2   Ready    <none>          5m    v1.29.x
worker3   Ready    <none>          4m    v1.29.x
worker4   Ready    <none>          4m    v1.29.x
worker5   Ready    <none>          3m    v1.29.x
```

**Wait until all nodes show `Ready` before proceeding!**

#### Step 2.5: Deploy Application (MASTER ONLY)

```bash
./deploy-app.sh
```

**What gets deployed:**
- Namespace: `campconnect`
- MongoDB (database)
- Backend (Spring Boot API) - 2 replicas
- Frontend (Angular/Nginx) - 2 replicas

#### Step 2.6: Deploy Monitoring (MASTER ONLY - Optional)

```bash
./deploy-monitoring.sh
```

**Deploys:**
- Prometheus (metrics collection)
- Grafana (dashboards)

---

### PHASE 3: Access the Application

#### Get Service URLs

```bash
# Get all services and their ports
kubectl get svc -n campconnect
```

#### Access via NodePort

```bash
# Get the NodePort for frontend
kubectl get svc frontend-service -n campconnect -o jsonpath='{.spec.ports[0].nodePort}'
```

Then access: `http://<ANY_NODE_IP>:<NodePort>`

#### Access via Port Forwarding (Alternative)

```bash
# Forward frontend to localhost:8080
kubectl port-forward svc/frontend-service 8080:80 -n campconnect

# Then access: http://localhost:8080
```

---

## Troubleshooting

### Node Can't Join Cluster

**Symptoms:** `kubeadm join` fails or times out

**Solutions:**
1. Check master IP is correct and reachable:
   ```bash
   ping <MASTER_IP>
   ```

2. Check firewall on master allows port 6443:
   ```bash
   # On Windows, allow in firewall
   # Or in WSL:
   sudo ufw allow 6443/tcp
   ```

3. Verify the join token hasn't expired (tokens expire after 24h):
   ```bash
   # On master, generate new token
   kubeadm token create --print-join-command
   ```

### Pods Stuck in Pending

**Check why:**
```bash
kubectl describe pod <pod-name> -n campconnect
```

**Common causes:**
- Insufficient resources → Check node capacity
- No nodes available → Check `kubectl get nodes`
- PVC not bound → Check storage provisioner

### Images Can't Be Pulled

**Symptoms:** `ImagePullBackOff` or `ErrImagePull`

**Solutions:**
1. Verify image name is correct in YAML files
2. Verify images are pushed to Docker Hub:
   ```bash
   docker pull YOUR_USERNAME/campconnect-backend:latest
   ```
3. Check if Docker Hub requires login:
   ```bash
   # Create a secret for Docker Hub credentials
   kubectl create secret docker-registry dockerhub-secret \
     --docker-server=https://index.docker.io/v1/ \
     --docker-username=YOUR_USERNAME \
     --docker-password=YOUR_PASSWORD \
     -n campconnect
   ```

### Pods Keep Restarting

**Check logs:**
```bash
kubectl logs <pod-name> -n campconnect
kubectl logs <pod-name> -n campconnect --previous  # Previous instance
```

### Network Issues Between Pods

**Check Flannel is running:**
```bash
kubectl get pods -n kube-flannel
```

**Restart Flannel if needed:**
```bash
kubectl delete pod -n kube-flannel -l app=flannel
```

---

## Reset and Start Over

If something goes wrong and you need to reset:

**On any node:**
```bash
./reset-cluster.sh
```

**Then start again from Phase 2.**

---

## Useful Commands Reference

### Cluster Status
```bash
kubectl get nodes                    # List all nodes
kubectl get pods -A                  # All pods in all namespaces
kubectl get pods -n campconnect      # Pods in campconnect namespace
kubectl get svc -n campconnect       # Services
kubectl get all -n campconnect       # Everything
```

### Logs
```bash
kubectl logs -f deployment/backend -n campconnect     # Backend logs
kubectl logs -f deployment/frontend -n campconnect    # Frontend logs
kubectl logs -f deployment/mongodb -n campconnect     # MongoDB logs
```

### Debugging
```bash
kubectl describe pod <pod-name> -n campconnect        # Pod details
kubectl exec -it <pod-name> -n campconnect -- /bin/sh # Shell into pod
kubectl get events -n campconnect --sort-by='.lastTimestamp'  # Recent events
```

### Scaling
```bash
kubectl scale deployment/backend --replicas=3 -n campconnect  # Scale backend
kubectl scale deployment/frontend --replicas=3 -n campconnect # Scale frontend
```

### Cleanup
```bash
kubectl delete namespace campconnect  # Delete everything
```

---

## File Structure

```
k8s/
├── scripts/
│   ├── prerequisites.sh      # Run on ALL nodes
│   ├── master-setup.sh       # Run on MASTER only
│   ├── worker-setup.sh       # Run on WORKERS only
│   ├── deploy-app.sh         # Deploy application
│   ├── deploy-monitoring.sh  # Deploy Prometheus/Grafana
│   └── reset-cluster.sh      # Reset if needed
├── monitoring/
│   ├── prometheus-config.yaml
│   ├── prometheus.yaml
│   └── grafana.yaml
├── namespace.yaml
├── configmap.yaml
├── secrets.yaml
├── mongodb.yaml
├── backend.yaml
├── frontend.yaml
├── ingress.yaml
└── CLUSTER-SETUP.md          # This file
```

---

## Contact & Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Run `kubectl describe` on failing resources
3. Check pod logs with `kubectl logs`
4. Ask the team lead (master node operator)

---

**Good luck with your deployment!** 🚀
