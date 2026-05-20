#!/usr/bin/env bash
set -euo pipefail

# Simple deploy script using Azure CLI. Replace LOCATION if desired.
APP_NAME="ClaudeIntegrationTest1"
RG_NAME="TestApplications"
LOCATION="eastus"
PLAN_NAME="${RG_NAME}-plan"

function ensure_az() {
  if ! command -v az >/dev/null 2>&1; then
    echo "Azure CLI (az) not found. Install from https://aka.ms/InstallAzureCli"
    exit 1
  fi
}

ensure_az

echo "Creating resource group: $RG_NAME in $LOCATION"
az group create --name "$RG_NAME" --location "$LOCATION"

echo "Creating App Service plan: $PLAN_NAME"
az appservice plan create --name "$PLAN_NAME" --resource-group "$RG_NAME" --sku B1 --is-linux

echo "Creating web app: $APP_NAME"
az webapp create --resource-group "$RG_NAME" --plan "$PLAN_NAME" --name "$APP_NAME" --runtime "NODE|18-lts"

echo "Packaging dist to dist.zip"
if [ ! -d dist ]; then
  echo "dist directory not found. Run: npm run build" && exit 1
fi
cd dist
zip -r ../dist.zip .
cd ..

echo "Deploying dist.zip to web app"
az webapp deploy --resource-group "$RG_NAME" --name "$APP_NAME" --src-path dist.zip

echo "Deployment complete. Browse to https://${APP_NAME}.azurewebsites.net"
