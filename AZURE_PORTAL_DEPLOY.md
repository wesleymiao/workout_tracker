# Deploy to Azure via Portal

## Step-by-Step Guide

### 1. Prepare Your Code

First, create a ZIP file of your project:

```powershell
# Compress the project (exclude node_modules and data folders)
Compress-Archive -Path .\public, .\server.js, .\package.json -DestinationPath workout-tracker.zip -Force
```

Or manually:
- Select these files/folders: `public/`, `server.js`, `package.json`
- Right-click → Send to → Compressed (zipped) folder
- Name it `workout-tracker.zip`

### 2. Create Web App in Azure Portal

1. **Go to Azure Portal**: https://portal.azure.com

2. **Create Resource**:
   - Click "Create a resource" (top left)
   - Search for "Web App"
   - Click "Create"

3. **Configure Basic Settings**:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new → `workout-tracker-rg`
   - **Name**: `workout-tracker-yourname` (must be globally unique)
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Try multiple regions if one fails:
     - West US 2
     - West Europe
     - Southeast Asia
     - UK South

4. **App Service Plan**:
   - Click "Create new"
   - **Name**: `workout-tracker-plan`
   - **Pricing tier**: Click "Explore pricing plans"
     - Select **F1 (Free)** 
     - Or **B1 (Basic)** if F1 doesn't work
   - Click "Select"

5. **Review + Create**:
   - Click "Review + create"
   - Click "Create"
   - Wait 1-2 minutes for deployment

### 3. Deploy Your Code

#### Method A: Deployment Center (Recommended)

1. **Go to your Web App**:
   - In Azure Portal, go to "All resources"
   - Click on your web app (`workout-tracker-yourname`)

2. **Open Deployment Center**:
   - In left menu, scroll down to "Deployment"
   - Click "Deployment Center"

3. **Configure Deployment**:
   - **Source**: Select "Local Git" or "External Git"
   - Click "Save"

4. **Upload via FTP/Kudu**:
   - Go to "Deployment Center" → "FTPS credentials"
   - Copy the FTPS endpoint and credentials
   
   OR use Kudu (easier):
   - In left menu, click "Advanced Tools" → "Go"
   - In Kudu, click "Tools" → "Zip Push Deploy"
   - Drag and drop your `workout-tracker.zip` file
   - Wait for extraction to complete

#### Method B: ZIP Deploy (Easiest)

1. **Get publish profile**:
   - In your Web App overview, click "Download publish profile" (top menu)
   - Save the file

2. **Deploy with PowerShell**:
```powershell
# Install Az module if not installed
Install-Module -Name Az -AllowClobber -Scope CurrentUser

# Login
Connect-AzAccount

# Deploy ZIP
Publish-AzWebApp -ResourceGroupName "workout-tracker-rg" -Name "workout-tracker-yourname" -ArchivePath ".\workout-tracker.zip"
```

OR use the portal directly:
- Go to your Web App
- In left menu, click "Advanced Tools" → "Go →"
- This opens Kudu console
- Navigate to: https://workout-tracker-yourname.scm.azurewebsites.net/ZipDeployUI
- Drag your ZIP file to the page

### 4. Configure Application

1. **Go to Configuration**:
   - In your Web App, click "Configuration" (left menu under Settings)

2. **Add startup command** (if needed):
   - Click "General settings" tab
   - **Startup Command**: `npm start`
   - Click "Save"

3. **Restart the app**:
   - Click "Overview" (top left)
   - Click "Restart" (top menu)

### 5. Access Your App

Your app will be available at:
```
https://workout-tracker-yourname.azurewebsites.net
```

### Troubleshooting

**View Logs**:
- Go to "Log stream" (left menu under Monitoring)
- Watch for errors during startup

**If app doesn't start**:
1. Check "Diagnose and solve problems"
2. Look for startup errors in Log stream
3. Ensure `package.json` has correct start script

**Still having quota issues?**
- Try different regions in Step 2.3
- Or use Vercel/Railway as suggested earlier

### Notes

- Free tier (F1) has limitations: 60 min/day compute time
- For 24/7 availability, use B1 tier (if quota allows) or switch to Vercel/Railway
