# Multi-Account S3 State Backend Setup

## Overview

Create S3 buckets for Terragrunt remote state management in all organization member accounts using dynamic discovery.

## Prerequisites

- Organization deployment completed (see 04-organization-deployment.md)
- AWS CLI configured with profile `17dec25`
- Root account access (083777493764)
- Member accounts: dev, staging, prod created
- `jq` command-line JSON processor installed

## Step 1: Run Dynamic S3 Bootstrap Script

```bash
# Navigate to project directory
cd /Users/c.chandran/lab/2025/aws-multi-account-lab

# Execute dynamic S3 bootstrap script
./scripts/bootstrap-dynamic-s3.sh
```

## Step 2: Verify S3 Buckets Creation

```bash
# Check buckets exist in each account
# Dev account
aws s3 ls s3://tbyte-terragrunt-state-575491070504 --profile dev

# Staging account  
aws s3 ls s3://tbyte-terragrunt-state-240783391550 --profile staging

# Prod account
aws s3 ls s3://tbyte-terragrunt-state-586643076348 --profile prod
```

## What the Script Does

### Dynamic Discovery
- **Auto-detects**: All accounts in AWS Organization
- **Excludes**: Root account (already has S3 bucket)
- **Processes**: Any number of member accounts (3, 5, 10+)

### S3 Bucket Creation (Per Account)
- **Bucket Name**: `tbyte-terragrunt-state-{ACCOUNT_ID}`
- **Versioning**: Enabled for state history
- **Encryption**: AES256 server-side encryption
- **Region**: eu-central-1
- **Access**: Uses OrganizationAccountAccessRole

## Expected Output

```
🚀 Dynamic multi-account S3 bootstrap
Root account: 083777493764
Region: eu-central-1

🔍 Discovering accounts in organization...
📋 Found accounts:
   586643076348 (aws-multi-account-lab-prod)
   575491070504 (aws-multi-account-lab-dev)
   240783391550 (aws-multi-account-lab-staging)

📦 Creating S3 bucket for aws-multi-account-lab-prod
   Account: 586643076348
   Bucket: tbyte-terragrunt-state-586643076348
{
    "Location": "http://tbyte-terragrunt-state-586643076348.s3.amazonaws.com/"
}
   ✅ S3 bucket created: tbyte-terragrunt-state-586643076348

📦 Creating S3 bucket for aws-multi-account-lab-dev
   Account: 575491070504
   Bucket: tbyte-terragrunt-state-575491070504
{
    "Location": "http://tbyte-terragrunt-state-575491070504.s3.amazonaws.com/"
}
   ✅ S3 bucket created: tbyte-terragrunt-state-575491070504

📦 Creating S3 bucket for aws-multi-account-lab-staging
   Account: 240783391550
   Bucket: tbyte-terragrunt-state-240783391550
{
    "Location": "http://tbyte-terragrunt-state-240783391550.s3.amazonaws.com/"
}
   ✅ S3 bucket created: tbyte-terragrunt-state-240783391550

🎉 Dynamic S3 bootstrap complete!

📊 Summary:
   Accounts processed: 3
   Buckets created/verified: 3

📋 Bucket naming pattern: tbyte-terragrunt-state-{ACCOUNT_ID}
🔧 Features enabled: Versioning, AES256 encryption
```

## Script Features

### Dynamic Scalability
- **Works with any organization size** (3 to 100+ accounts)
- **Auto-discovery** via `aws organizations list-accounts`
- **Consistent naming** across all accounts
- **Idempotent** - safe to run multiple times

### Security & Access
- **Role assumption** using OrganizationAccountAccessRole
- **Temporary credentials** for each account operation
- **No long-lived credentials** stored or transmitted
- **Least privilege** access per account

### Error Handling
- **Graceful failures** if role assumption fails
- **Bucket existence check** prevents duplicate creation errors
- **Clear error messages** with troubleshooting hints
- **Continue processing** other accounts if one fails

## Troubleshooting

**Error: "Failed to assume role"**
- OrganizationAccountAccessRole doesn't exist in target account
- Wait a few minutes after account creation for role to be available
- Check account is active and accessible

**Error: "Bucket already exists"**
- This is normal - script is idempotent
- Bucket was created in previous run
- Script will skip and continue

**Error: "jq: command not found"**
```bash
# Install jq
# macOS: brew install jq
# Linux: sudo apt install jq
```

**Error: "Access denied"**
- Check AWS profile is set: `export AWS_PROFILE=17dec25`
- Verify root account has organization management permissions
- Ensure accounts are active (not suspended)

## Security Notes

- **Cross-account access** via OrganizationAccountAccessRole only
- **Buckets are private** by default in each account
- **Encryption at rest** with AES256
- **Versioning protects** against state corruption
- **Regional isolation** - buckets created in target region

## Next Steps

After S3 buckets are created in all accounts:
1. Set up GitHub OIDC in each account for secure CI/CD access
2. Configure Terragrunt backend configurations for each environment
3. Deploy infrastructure (VPC, EKS) using account-specific state buckets
4. Set up cross-account IAM roles for infrastructure management
