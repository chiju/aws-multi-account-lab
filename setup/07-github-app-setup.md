# GitHub App Setup for ArgoCD

## Overview

Create a GitHub App to allow ArgoCD to authenticate and access your repository securely without using personal access tokens.

## Prerequisites

- GitHub account with repository access
- GitHub CLI installed and authenticated
- Repository: `chiju/aws-multi-account-lab`

## Step 1: Create GitHub App

**Go to:** https://github.com/settings/apps/new

### Required Settings

**Basic Information:**
- **Name**: `ArgoCD-Multi-Account-Lab`
- **Homepage**: `https://github.com/chiju/aws-multi-account-lab`
- **Webhook**: ✅ **Uncheck "Active"** (we don't need webhooks)

**Repository Permissions:**
- **Contents**: `Read-only` (ArgoCD needs to read your repo)
- **Metadata**: `Read-only` (automatically required)

**Installation:**
- **Where can this app be installed**: `Only on this account`

Click **Create GitHub App**

## Step 2: Generate Private Key

1. After creation, scroll down to **Private keys** section
2. Click **Generate a private key**
3. A `.pem` file will be downloaded (e.g., `argocd-multi-account-lab.2025-12-17.private-key.pem`)

## Step 3: Note App ID

On the app settings page, note the **App ID** near the top

Example: `2490986`

## Step 4: Install App on Repository

1. Click **Install App** in the left sidebar
2. Click **Install** next to your account
3. Select **Only select repositories**
4. Choose `aws-multi-account-lab` repository
5. Click **Install**

## Step 5: Note Installation ID

After installation, you'll be redirected to a URL like:
```
https://github.com/settings/installations/100064065
```

The number at the end (`100064065`) is your **Installation ID**

## Step 6: Store GitHub Secrets

```bash
# Navigate to Downloads folder (or wherever the .pem file was saved)
cd ~/Desktop/down

# Set private key
gh secret set ARGOCD_APP_PRIVATE_KEY < argocd-multi-account-lab.2025-12-17.private-key.pem --repo chiju/aws-multi-account-lab

# Set App ID
gh secret set ARGOCD_APP_ID -b "2490986" --repo chiju/aws-multi-account-lab

# Set Installation ID
gh secret set ARGOCD_APP_INSTALLATION_ID -b "100064065" --repo chiju/aws-multi-account-lab
```

## Step 7: Verify Secrets

```bash
gh secret list --repo chiju/aws-multi-account-lab | grep ARGOCD
```

**Expected output:**
```
ARGOCD_APP_ID                   2025-12-17T18:10:08Z
ARGOCD_APP_INSTALLATION_ID      2025-12-17T18:10:09Z
ARGOCD_APP_PRIVATE_KEY          2025-12-17T18:10:07Z
```

## What the Script Created

### GitHub App Details
- **App ID**: `2490986`
- **Installation ID**: `100064065`
- **Private Key**: Stored in GitHub Secrets
- **Permissions**: Read-only access to repository contents

### GitHub Secrets
- **ARGOCD_APP_ID**: Used by ArgoCD to identify the app
- **ARGOCD_APP_INSTALLATION_ID**: Used to authenticate as the installed app
- **ARGOCD_APP_PRIVATE_KEY**: Used to sign authentication requests

## Expected Output

```
✅ All secrets set!

ARGOCD_APP_ID                   2025-12-17T18:10:08Z
ARGOCD_APP_INSTALLATION_ID      2025-12-17T18:10:09Z
ARGOCD_APP_PRIVATE_KEY          2025-12-17T18:10:07Z
```

## How It Works

1. **ArgoCD** uses the App ID and Installation ID to identify itself
2. **Private Key** signs JWT tokens for authentication
3. **GitHub** validates the token and grants read access to the repository
4. **ArgoCD** can now sync applications from the repository

## Security Benefits

- ✅ **No personal access tokens** - App credentials are scoped to the repository
- ✅ **Fine-grained permissions** - Only read access to repository contents
- ✅ **Revocable** - Can be uninstalled anytime without affecting other apps
- ✅ **Audit trail** - GitHub tracks all app access
- ✅ **Reusable** - Same app can be used across multiple environments

## Troubleshooting

**Error: App not found**
```bash
# Verify the App ID is correct
gh secret list --repo chiju/aws-multi-account-lab | grep ARGOCD_APP_ID
```

**Error: Authentication failed**
```bash
# Verify the private key was uploaded correctly
gh secret list --repo chiju/aws-multi-account-lab | grep ARGOCD_APP_PRIVATE_KEY
```

**Error: Permission denied**
- Verify the app has "Contents: Read" permission in GitHub App settings
- Check that the app is installed on the correct repository

## Next Steps

After GitHub App setup is complete:
1. Deploy EKS cluster using the multi-account-infrastructure workflow
2. ArgoCD will be installed and configured to use the GitHub App
3. Applications will be automatically synced from the repository
