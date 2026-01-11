# Azure Deployment Guide

## Quick Deploy to Azure App Service

### Prerequisites
- Azure subscription
- Azure CLI installed

### Installation

1. **Install Azure CLI** (if not already installed):
   - Download from: https://aka.ms/installazurecliwindows
   - Or use: `winget install -e --id Microsoft.AzureCLI`

### Deployment Steps

1. **Login to Azure**:
```bash
az login
```

2. **Set your subscription** (if you have multiple):
```bash
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

3. **Create a resource group** (skip if you want to use existing):
```bash
az group create --name workout-tracker-rg --location eastus
```

4. **Create an App Service Plan**:
```bash
az appservice plan create --name workout-tracker-plan --resource-group workout-tracker-rg --sku B1 --is-linux
```

5. **Create the Web App**:
```bash
az webapp create --name workout-tracker-<your-unique-name> --resource-group workout-tracker-rg --plan workout-tracker-plan --runtime "NODE:18-lts"
```

6. **Deploy the code**:
```bash
az webapp up --name workout-tracker-<your-unique-name> --resource-group workout-tracker-rg --runtime "NODE:18-lts"
```

Your app will be available at: `https://workout-tracker-<your-unique-name>.azurewebsites.net`

### Alternative: One-Command Deployment

From your project directory, run:
```bash
az webapp up --name workout-tracker-<your-unique-name> --runtime "NODE:18-lts" --sku B1 --location eastus
```

This automatically creates all required resources and deploys your app!

### Configuration

Set environment variables if needed:
```bash
az webapp config appsettings set --name workout-tracker-<your-unique-name> --resource-group workout-tracker-rg --settings PORT=8080
```

### Update Deployment

To redeploy after changes:
```bash
az webapp up --name workout-tracker-<your-unique-name>
```

### View Logs

```bash
az webapp log tail --name workout-tracker-<your-unique-name> --resource-group workout-tracker-rg
```

### Pricing

- **B1 Basic Plan**: ~$13.14/month
- **F1 Free Plan**: Free (limited resources, for testing)

To use free plan, change `--sku B1` to `--sku F1` in the commands above.

### Notes

- Replace `<your-unique-name>` with a unique name (globally unique across all Azure)
- The app name will be part of your URL
- Data is stored in the filesystem (consider Azure Storage or CosmosDB for production)
