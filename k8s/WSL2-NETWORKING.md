# WSL2 Networking Setup for Kubernetes Cluster

## Why This Guide Matters

By default, WSL2 uses **NAT (Network Address Translation)** mode. This means:
- Your WSL2 instance gets an internal IP address (like `172.x.x.x`)
- This IP is **NOT visible** to other computers on your network
- Your teammates' machines **cannot connect** to your Kubernetes cluster

**For our multi-node K8s cluster to work, all machines must be able to reach each other.**

This guide will help you configure WSL2 so that other machines can connect to yours.

---

## Quick Reference

| Your Role | What You Need |
|-----------|---------------|
| **Master Node** | Other machines must reach your port `6443` (K8s API) |
| **Worker Node** | Master must reach your port `10250` (Kubelet) |
| **All Nodes** | Ports `30000-32767` for accessing deployed apps |

---

## Option A: Mirrored Mode (Recommended for Windows 11)

This is the **easiest and most reliable** method for Windows 11 users.

### What is Mirrored Mode?

Mirrored mode makes your WSL2 instance share the same IP address as your Windows machine. This means:
- If your Windows IP is `192.168.1.50`, your WSL2 will also use `192.168.1.50`
- Other machines can connect to your WSL2 services directly
- No port forwarding needed!

### Step-by-Step Setup

#### Step 1: Open File Explorer

Press `Win + E` to open File Explorer.

#### Step 2: Navigate to Your User Folder

In the address bar, type:
```
%USERPROFILE%
```
Press Enter. This takes you to `C:\Users\YourName\`

#### Step 3: Create or Edit .wslconfig File

Look for a file named `.wslconfig` (note the dot at the beginning).

**If it doesn't exist:**
1. Right-click in the folder
2. Select **New** > **Text Document**
3. Name it `.wslconfig` (delete the `.txt` extension)
4. If Windows warns about changing the extension, click **Yes**

**If it exists:**
1. Right-click on `.wslconfig`
2. Select **Open with** > **Notepad**

#### Step 4: Add the Configuration

Add these lines to the file:

```ini
[wsl2]
networkingMode=mirrored
```

Save the file (`Ctrl + S`).

#### Step 5: Restart WSL2

Open **PowerShell** or **Command Prompt** and run:

```powershell
wsl --shutdown
```

Wait 5 seconds, then start WSL again (open Ubuntu or your WSL terminal).

#### Step 6: Verify It's Working

In your WSL2 terminal, run:

```bash
hostname -I
```

This should now show your **Windows IP address** (like `192.168.1.50`) instead of an internal IP (like `172.x.x.x`).

**Also verify in PowerShell:**
```powershell
ipconfig
```

Your WSL2 IP and Windows IP should match (or be on the same subnet).

---

## Option B: Port Forwarding (Fallback Method)

Use this method if:
- Mirrored mode doesn't work for you
- You're on Windows 10
- You need more control over which ports are exposed

### How Port Forwarding Works

```
[Other Machine] --> [Your Windows IP:6443] --> [WSL2 IP:6443]
```

We tell Windows: "When someone connects to port 6443, forward it to WSL2"

### Automated Setup (Recommended)

We've created a PowerShell script to do this automatically:

1. Open **PowerShell as Administrator**
   - Press `Win`, type "PowerShell"
   - Right-click on "Windows PowerShell"
   - Select "Run as administrator"

2. Navigate to the project:
   ```powershell
   cd C:\Users\YourName\Desktop\PI\ConnectCamp\k8s\scripts
   ```

3. Allow script execution (one-time):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. Run the script:
   ```powershell
   .\setup-port-forwarding.ps1
   ```

5. Choose your role when prompted:
   - Enter `1` if you're the **Master** node
   - Enter `2` if you're a **Worker** node

### Manual Setup (If Script Doesn't Work)

Open **PowerShell as Administrator** and run these commands:

#### Step 1: Get Your WSL2 IP Address

```powershell
wsl hostname -I
```

Note this IP (e.g., `172.25.123.45`)

#### Step 2: Set Up Port Forwarding

**For MASTER node:**
```powershell
# Replace 172.25.123.45 with YOUR WSL2 IP
netsh interface portproxy add v4tov4 listenport=6443 listenaddress=0.0.0.0 connectport=6443 connectaddress=172.25.123.45
netsh interface portproxy add v4tov4 listenport=10250 listenaddress=0.0.0.0 connectport=10250 connectaddress=172.25.123.45
netsh interface portproxy add v4tov4 listenport=2379 listenaddress=0.0.0.0 connectport=2379 connectaddress=172.25.123.45
netsh interface portproxy add v4tov4 listenport=2380 listenaddress=0.0.0.0 connectport=2380 connectaddress=172.25.123.45
```

**For WORKER node:**
```powershell
# Replace 172.25.123.45 with YOUR WSL2 IP
netsh interface portproxy add v4tov4 listenport=10250 listenaddress=0.0.0.0 connectport=10250 connectaddress=172.25.123.45
```

#### Step 3: Verify Port Forwarding

```powershell
netsh interface portproxy show all
```

You should see your forwarding rules listed.

### Removing Port Forwarding (If Needed)

To remove all port forwarding rules:
```powershell
netsh interface portproxy reset
```

---

## Windows Firewall Configuration

Even with networking configured, Windows Firewall might block incoming connections.

### Method 1: Using Windows Settings (GUI)

#### Step 1: Open Windows Defender Firewall

1. Press `Win`, type "firewall"
2. Click on "Windows Defender Firewall with Advanced Security"

#### Step 2: Create Inbound Rule for Kubernetes API (Master Only)

1. Click **Inbound Rules** on the left
2. Click **New Rule...** on the right
3. Select **Port**, click Next
4. Select **TCP**, enter `6443`, click Next
5. Select **Allow the connection**, click Next
6. Check all profiles (Domain, Private, Public), click Next
7. Name it `Kubernetes API Server`, click Finish

#### Step 3: Create Inbound Rule for Kubelet (All Nodes)

Repeat the above steps for port `10250`, name it `Kubernetes Kubelet`

#### Step 4: Create Inbound Rule for NodePort Range (All Nodes)

Repeat for ports `30000-32767`, name it `Kubernetes NodePort Services`

### Method 2: Using PowerShell (Faster)

Open **PowerShell as Administrator** and run:

```powershell
# Kubernetes API Server (Master only)
New-NetFirewallRule -DisplayName "Kubernetes API Server" -Direction Inbound -Protocol TCP -LocalPort 6443 -Action Allow

# Kubelet (All nodes)
New-NetFirewallRule -DisplayName "Kubernetes Kubelet" -Direction Inbound -Protocol TCP -LocalPort 10250 -Action Allow

# NodePort Services (All nodes)
New-NetFirewallRule -DisplayName "Kubernetes NodePort Services" -Direction Inbound -Protocol TCP -LocalPort 30000-32767 -Action Allow

# etcd (Master only)
New-NetFirewallRule -DisplayName "Kubernetes etcd" -Direction Inbound -Protocol TCP -LocalPort 2379-2380 -Action Allow
```

### Verify Firewall Rules

```powershell
Get-NetFirewallRule -DisplayName "Kubernetes*" | Select-Object DisplayName, Enabled, Direction
```

---

## Testing Connectivity

Before proceeding with Kubernetes setup, verify that machines can communicate.

### Step 1: Find Your Windows IP Address

Open **PowerShell** and run:
```powershell
ipconfig
```

Look for `IPv4 Address` under your network adapter (usually Wi-Fi or Ethernet).
Example: `192.168.1.50`

**Share this IP with your team!**

### Step 2: Test Basic Connectivity (Ping)

On another machine, open **PowerShell** and run:
```powershell
ping 192.168.1.50
```
(Replace with the IP you want to test)

**Expected result:**
```
Reply from 192.168.1.50: bytes=32 time=2ms TTL=128
```

**If you see "Request timed out":**
- Check that both machines are on the same network
- Verify Windows Firewall allows ping (ICMP)

### Step 3: Test Port Connectivity

Once the master has Kubernetes running, workers can test connectivity:

```powershell
Test-NetConnection -ComputerName 192.168.1.50 -Port 6443
```

**Expected result:**
```
TcpTestSucceeded : True
```

---

## Troubleshooting

### Problem: WSL2 IP Keeps Changing

**Symptom:** Every time you restart WSL2, it gets a different IP address.

**Solution:** Use **Mirrored Mode** (Option A above), which eliminates this problem entirely.

**Alternative:** If you must use port forwarding, run the `setup-port-forwarding.ps1` script each time you start WSL2.

---

### Problem: "Connection Refused" When Joining Cluster

**Symptom:** Worker nodes can't connect to master on port 6443.

**Checklist:**
1. Is the master's Kubernetes running? (`kubectl get nodes` on master)
2. Is port forwarding set up? (`netsh interface portproxy show all`)
3. Is firewall allowing port 6443? (Check firewall rules)
4. Can you ping the master? (`ping <master-ip>`)
5. Is the master IP correct in the join command?

---

### Problem: Mirrored Mode Not Working

**Symptom:** After enabling mirrored mode, WSL2 still shows internal IP.

**Solutions:**
1. Make sure you saved the `.wslconfig` file correctly
2. Run `wsl --shutdown` and wait 10 seconds
3. Check for typos in the config file
4. Try rebooting Windows completely

---

### Problem: Nodes Show "NotReady" Status

**Symptom:** `kubectl get nodes` shows workers as NotReady.

**Causes:**
- Network plugin (Flannel) not running properly
- Kubelet can't communicate with master

**Solutions:**
1. Check kubelet status on worker: `sudo systemctl status kubelet`
2. Check kubelet logs: `sudo journalctl -u kubelet -f`
3. Verify network connectivity to master

---

## Summary Checklist

Before proceeding to Kubernetes setup, verify:

- [ ] WSL2 networking configured (mirrored mode OR port forwarding)
- [ ] Windows Firewall rules created for ports 6443, 10250, 30000-32767
- [ ] You know your Windows IP address
- [ ] You can ping other team members' machines
- [ ] All team members are on the same local network

**Once all boxes are checked, proceed to [CLUSTER-SETUP.md](./CLUSTER-SETUP.md)!**
