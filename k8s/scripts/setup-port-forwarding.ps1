# ============================================================
# CampConnect Kubernetes Port Forwarding Setup Script
# Run this in PowerShell as Administrator
# ============================================================

param(
    [switch]$Reset,
    [switch]$Verify
)

# Colors for output
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }

Write-Host ""
Write-Host "============================================================" -ForegroundColor Blue
Write-Host "   CampConnect Kubernetes Port Forwarding Setup" -ForegroundColor Blue
Write-Host "============================================================" -ForegroundColor Blue
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "ERROR: This script must be run as Administrator!"
    Write-Warning "Right-click PowerShell and select 'Run as administrator'"
    exit 1
}

# Reset mode - remove all port forwarding rules
if ($Reset) {
    Write-Warning "Resetting all port forwarding rules..."
    netsh interface portproxy reset
    Write-Success "All port forwarding rules removed."
    
    Write-Warning "Removing Kubernetes firewall rules..."
    Get-NetFirewallRule -DisplayName "Kubernetes*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule
    Write-Success "Firewall rules removed."
    exit 0
}

# Verify mode - show current configuration
if ($Verify) {
    Write-Info "Current Port Forwarding Rules:"
    Write-Host ""
    netsh interface portproxy show all
    Write-Host ""
    Write-Info "Kubernetes Firewall Rules:"
    Get-NetFirewallRule -DisplayName "Kubernetes*" -ErrorAction SilentlyContinue | 
        Select-Object DisplayName, Enabled, Direction | Format-Table
    exit 0
}

# Get WSL2 IP address
Write-Info "[1/4] Detecting WSL2 IP address..."
$wslIp = (wsl hostname -I 2>$null)
if ($wslIp) {
    $wslIp = $wslIp.Trim().Split()[0]
}

if ([string]::IsNullOrEmpty($wslIp)) {
    Write-Error "ERROR: Could not detect WSL2 IP address."
    Write-Warning "Make sure WSL2 is running (open Ubuntu first)."
    exit 1
}

Write-Success "WSL2 IP Address: $wslIp"
Write-Host ""

# Get Windows IP address
$windowsIp = (Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object { $_.InterfaceAlias -notmatch "Loopback" -and $_.IPAddress -notmatch "^169" } | 
    Select-Object -First 1).IPAddress

Write-Success "Windows IP Address: $windowsIp"
Write-Host ""

# Ask for node role
Write-Info "[2/4] Select your node role:"
Write-Host ""
Write-Host "  1. MASTER node (runs Kubernetes control plane)"
Write-Host "  2. WORKER node (joins the cluster)"
Write-Host ""
$role = Read-Host "Enter 1 or 2"

if ($role -ne "1" -and $role -ne "2") {
    Write-Error "Invalid selection. Please enter 1 or 2."
    exit 1
}

# Clear existing port forwarding rules
Write-Info "[3/4] Setting up port forwarding rules..."
Write-Warning "Clearing existing rules..."
netsh interface portproxy reset | Out-Null

# Set up port forwarding based on role
if ($role -eq "1") {
    Write-Info "Configuring as MASTER node..."
    
    # Kubernetes API Server
    netsh interface portproxy add v4tov4 listenport=6443 listenaddress=0.0.0.0 connectport=6443 connectaddress=$wslIp | Out-Null
    Write-Success "  - Port 6443 (Kubernetes API Server)"
    
    # etcd
    netsh interface portproxy add v4tov4 listenport=2379 listenaddress=0.0.0.0 connectport=2379 connectaddress=$wslIp | Out-Null
    netsh interface portproxy add v4tov4 listenport=2380 listenaddress=0.0.0.0 connectport=2380 connectaddress=$wslIp | Out-Null
    Write-Success "  - Ports 2379-2380 (etcd)"
    
    # kube-scheduler and kube-controller-manager
    netsh interface portproxy add v4tov4 listenport=10259 listenaddress=0.0.0.0 connectport=10259 connectaddress=$wslIp | Out-Null
    netsh interface portproxy add v4tov4 listenport=10257 listenaddress=0.0.0.0 connectport=10257 connectaddress=$wslIp | Out-Null
    Write-Success "  - Ports 10259, 10257 (scheduler, controller-manager)"
}

# Kubelet (both master and worker)
netsh interface portproxy add v4tov4 listenport=10250 listenaddress=0.0.0.0 connectport=10250 connectaddress=$wslIp | Out-Null
Write-Success "  - Port 10250 (Kubelet API)"

# NodePort range (for accessing services)
# We forward a subset of common NodePorts (forwarding 2767 ports individually would be slow)
$nodePorts = @(30000, 30080, 30443, 31000, 32000)
foreach ($port in $nodePorts) {
    netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIp | Out-Null
}
Write-Success "  - Common NodePorts (30000, 30080, 30443, 31000, 32000)"

Write-Host ""
Write-Info "[4/4] Configuring Windows Firewall..."

# Remove old rules first
Get-NetFirewallRule -DisplayName "Kubernetes*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule

# Add firewall rules
if ($role -eq "1") {
    New-NetFirewallRule -DisplayName "Kubernetes API Server" -Direction Inbound -Protocol TCP -LocalPort 6443 -Action Allow | Out-Null
    Write-Success "  - Allowed port 6443 (API Server)"
    
    New-NetFirewallRule -DisplayName "Kubernetes etcd" -Direction Inbound -Protocol TCP -LocalPort 2379-2380 -Action Allow | Out-Null
    Write-Success "  - Allowed ports 2379-2380 (etcd)"
    
    New-NetFirewallRule -DisplayName "Kubernetes Scheduler" -Direction Inbound -Protocol TCP -LocalPort 10259 -Action Allow | Out-Null
    New-NetFirewallRule -DisplayName "Kubernetes Controller Manager" -Direction Inbound -Protocol TCP -LocalPort 10257 -Action Allow | Out-Null
    Write-Success "  - Allowed ports 10259, 10257 (scheduler, controller-manager)"
}

New-NetFirewallRule -DisplayName "Kubernetes Kubelet" -Direction Inbound -Protocol TCP -LocalPort 10250 -Action Allow | Out-Null
Write-Success "  - Allowed port 10250 (Kubelet)"

New-NetFirewallRule -DisplayName "Kubernetes NodePort Services" -Direction Inbound -Protocol TCP -LocalPort 30000-32767 -Action Allow | Out-Null
Write-Success "  - Allowed ports 30000-32767 (NodePort Services)"

# Summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "   SETUP COMPLETE!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Info "Your Configuration:"
Write-Host "  Windows IP (share this): $windowsIp" -ForegroundColor Yellow
Write-Host "  WSL2 IP (internal):      $wslIp"
Write-Host "  Role:                    $(if ($role -eq '1') { 'MASTER' } else { 'WORKER' })"
Write-Host ""

Write-Info "Current Port Forwarding Rules:"
netsh interface portproxy show all
Write-Host ""

if ($role -eq "1") {
    Write-Warning "NEXT STEPS (Master):"
    Write-Host "  1. In WSL2, run: ./master-setup.sh"
    Write-Host "  2. Share the join command with workers"
    Write-Host "  3. Share your Windows IP: $windowsIp"
} else {
    Write-Warning "NEXT STEPS (Worker):"
    Write-Host "  1. Get the join command from the master"
    Write-Host "  2. In WSL2, run: ./worker-setup.sh '<join-command>'"
}

Write-Host ""
Write-Info "Useful Commands:"
Write-Host "  Verify setup:  .\setup-port-forwarding.ps1 -Verify"
Write-Host "  Reset rules:   .\setup-port-forwarding.ps1 -Reset"
Write-Host ""
