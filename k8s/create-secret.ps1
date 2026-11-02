# ==============================================================================
#  DeployVerse — Kubernetes Secret Setup Script
#
#  This script creates the `deployverse-jenkins` Secret from the Backend/.env
#  file. It reads the credentials without printing them to the console.
#
#  PREREQUISITES:
#    - Minikube must be running  (minikube start)
#    - kubectl must be configured for Minikube context
#    - Backend/.env must contain JENKINS_USER and JENKINS_API_TOKEN
#
#  SAFE TO RUN MULTIPLE TIMES — uses --dry-run=client | kubectl apply
#  so it updates an existing Secret rather than erroring on duplicate.
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host "=== DeployVerse K8s Secret Setup ===" -ForegroundColor Cyan

# ── Read credentials from Backend/.env ────────────────────────────────────────
$envFile = Join-Path $PSScriptRoot "..\Backend\.env"

if (-not (Test-Path $envFile)) {
    Write-Error "Backend/.env not found at: $envFile"
    exit 1
}

$envVars = @{}
Get-Content $envFile | Where-Object { $_ -match "^\s*[^#]" -and $_ -match "=" } | ForEach-Object {
    $parts = $_ -split "=", 2
    $key   = $parts[0].Trim()
    $value = $parts[1].Trim()
    $envVars[$key] = $value
}

$jenkinsUser  = $envVars["JENKINS_USER"]
$jenkinsToken = $envVars["JENKINS_API_TOKEN"]

if (-not $jenkinsUser -or -not $jenkinsToken) {
    Write-Error "JENKINS_USER or JENKINS_API_TOKEN not found in Backend/.env"
    exit 1
}

Write-Host "Read credentials for user: $jenkinsUser" -ForegroundColor Green
Write-Host "(Token length: $($jenkinsToken.Length) chars — not displayed)" -ForegroundColor DarkGray

# ── Verify kubectl context ─────────────────────────────────────────────────────
$ctx = kubectl config current-context 2>&1
Write-Host "kubectl context: $ctx"

if ($ctx -ne "minikube") {
    Write-Warning "Current context is '$ctx', not 'minikube'. Continue? (Ctrl+C to abort)"
    Start-Sleep -Seconds 3
}

# ── Create/update the Secret ──────────────────────────────────────────────────
# Using --dry-run=client | apply is idempotent — safe to run multiple times.
Write-Host "`nCreating/updating secret 'deployverse-jenkins'..." -ForegroundColor Cyan

kubectl create secret generic deployverse-jenkins `
    --from-literal=username=$jenkinsUser `
    --from-literal=api-token=$jenkinsToken `
    --dry-run=client -o yaml | kubectl apply -f -

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create/update secret"
    exit 1
}

Write-Host "`n=== Secret created/updated successfully ===" -ForegroundColor Green
Write-Host "Verify with: kubectl get secret deployverse-jenkins"
Write-Host "(kubectl describe will not show values — only key names)"
kubectl get secret deployverse-jenkins -o "jsonpath={.data}" 2>&1 | ForEach-Object {
    # Show only key names, not values
    Write-Host "Secret keys present: $($_ -replace ':[^,}]+', ':***')"
}
