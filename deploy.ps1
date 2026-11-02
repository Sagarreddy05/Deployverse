# ==============================================================================
#  DeployVerse — Build, Load & Deploy Script
#
#  Runs AFTER Docker Desktop and Minikube are both running.
#
#  Steps:
#    1. Verify Docker daemon and Minikube context
#    2. Build backend Docker image
#    3. Build frontend Docker image
#    4. Load both images into Minikube (avoids registry requirement)
#    5. Create/update Kubernetes Secret from Backend/.env
#    6. Apply all K8s manifests (non-destructive — preserves PVC/data)
#    7. Wait for Pods to be ready
#    8. Print access instructions
#
#  SAFE TO RE-RUN — uses kubectl apply (not delete/recreate)
#  Database data is on a PersistentVolumeClaim and is NOT touched.
# ==============================================================================

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  DeployVerse - Build, Load `& Deploy" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# ── Step 1: Verify prerequisites ──────────────────────────────────────────────
Write-Host "`n[1/8] Verifying Docker daemon..." -ForegroundColor Yellow
$dockerVer = docker info --format "{{.ServerVersion}}" 2>&1
if ($LASTEXITCODE -ne 0) { Write-Error "Docker daemon not running. Start Docker Desktop first."; exit 1 }
Write-Host "  Docker server: $dockerVer" -ForegroundColor Green

Write-Host "`n[2/8] Verifying Minikube..." -ForegroundColor Yellow
$ctx = kubectl config current-context 2>&1
if ($ctx -ne "minikube") { Write-Warning "  kubectl context is '$ctx' - expected 'minikube'" }
$mkStatus = minikube status --format "{{.Host}}" 2>&1
if ($mkStatus -ne "Running") {
    Write-Host "  Minikube not running. Starting..." -ForegroundColor Yellow
    minikube start --driver=docker
}
Write-Host "  Minikube: $mkStatus" -ForegroundColor Green

# ── Step 2: Build backend image ───────────────────────────────────────────────
Write-Host "`n[3/8] Building backend Docker image..." -ForegroundColor Yellow
Push-Location (Join-Path $Root "Backend")
docker build -t deployverse-backend:latest .
if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Error "Backend Docker build failed"; exit 1 }
Write-Host "  Backend image built: deployverse-backend:latest" -ForegroundColor Green
Pop-Location

# ── Step 3: Build frontend image ─────────────────────────────────────────────
Write-Host "`n[4/8] Building frontend Docker image..." -ForegroundColor Yellow
Push-Location (Join-Path $Root "Frontend")
docker build -t deployverse-frontend:latest .
if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Error "Frontend Docker build failed"; exit 1 }
Write-Host "  Frontend image built: deployverse-frontend:latest" -ForegroundColor Green
Pop-Location

# ── Step 4: Load images into Minikube ────────────────────────────────────────
Write-Host "`n[5/8] Loading images into Minikube..." -ForegroundColor Yellow
Write-Host "  Loading backend (this may take 30-60s)..."
minikube image load deployverse-backend:latest
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to load backend image into Minikube"; exit 1 }

Write-Host "  Loading frontend (this may take 30-60s)..."
minikube image load deployverse-frontend:latest
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to load frontend image into Minikube"; exit 1 }
Write-Host "  Both images loaded into Minikube" -ForegroundColor Green

# ── Step 5: Create/update Kubernetes Secret ───────────────────────────────────
Write-Host "`n[6/8] Creating/updating Kubernetes Secret..." -ForegroundColor Yellow
$envFile = Join-Path $Root "Backend\.env"
$envVars = @{}
Get-Content $envFile | Where-Object { $_ -match "^\s*[^#]" -and $_ -match "=" } | ForEach-Object {
    $parts = $_ -split "=", 2
    $envVars[$parts[0].Trim()] = $parts[1].Trim()
}
$user  = $envVars["JENKINS_USER"]
$token = $envVars["JENKINS_API_TOKEN"]
if (-not $user -or -not $token) { Write-Error "Missing JENKINS_USER or JENKINS_API_TOKEN in Backend/.env"; exit 1 }

kubectl create secret generic deployverse-jenkins `
    --from-literal=username=$user `
    --from-literal=api-token=$token `
    --dry-run=client -o yaml | kubectl apply -f -
Write-Host "  Secret deployverse-jenkins: applied (credentials not displayed)" -ForegroundColor Green

# ── Step 6: Apply Kubernetes manifests ────────────────────────────────────────
Write-Host "`n[7/8] Applying Kubernetes manifests..." -ForegroundColor Yellow
$k8sDir = Join-Path $Root "k8s"

kubectl apply -f "$k8sDir\backend-storage.yaml"
kubectl apply -f "$k8sDir\backend-deployment.yaml"
kubectl apply -f "$k8sDir\frontend-deployment.yaml"
Write-Host "  All manifests applied" -ForegroundColor Green

# ── Step 7: Wait for Pods ─────────────────────────────────────────────────────
Write-Host "`n[8/8] Waiting for Pods to become Ready (up to 3 minutes)..." -ForegroundColor Yellow
kubectl rollout status deployment/deployverse-backend --timeout=180s
kubectl rollout status deployment/deployverse-frontend --timeout=180s

Write-Host "`n=== Pod Status ===" -ForegroundColor Cyan
kubectl get pods -o wide

Write-Host "`n=== Services ===" -ForegroundColor Cyan
kubectl get svc

# ── Print access instructions ─────────────────────────────────────────────────
Write-Host "`n======================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "To access the application, run one of the following:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Option A — Minikube service URL (opens browser):"
Write-Host "    minikube service deployverse-frontend"
Write-Host ""
Write-Host "  Option B — kubectl port-forward:"
Write-Host "    kubectl port-forward svc/deployverse-frontend 8081:80"
Write-Host "    Then open: http://localhost:8081"
Write-Host ""
Write-Host "  Backend API direct access (for testing):"
Write-Host "    kubectl port-forward svc/deployverse-backend 5001:5000"
Write-Host "    Then open: http://localhost:5001/api/health"
Write-Host ""
Write-Host "  View Pod logs:"
Write-Host "    kubectl logs -l app=deployverse-backend --tail=50"
Write-Host "    kubectl logs -l app=deployverse-frontend --tail=50"
Write-Host ""
