# S3 State Backend Setup

## Overview

Create S3 bucket for Terragrunt remote state management in the root AWS account.

## Prerequisites

- AWS CLI configured with profile `17dec25`
- Root account access (083777493764)
- Appropriate IAM permissions for S3 operations

## Step 1: Run Bootstrap Script

```bash
# Navigate to project directory
cd /Users/c.chandran/lab/2025/aws-multi-account-lab

# Execute S3 bootstrap script
./scripts/bootstrap-s3.sh
```

## Step 2: Verify S3 Bucket Creation

```bash
# Check bucket exists
aws s3 ls s3://tbyte-terragrunt-state-083777493764 --profile 17dec25

# Verify versioning is enabled
aws s3api get-bucket-versioning --bucket tbyte-terragrunt-state-083777493764 --profile 17dec25

# Verify encryption is enabled
aws s3api get-bucket-encryption --bucket tbyte-terragrunt-state-083777493764 --profile 17dec25
```

## What the Script Creates

- **S3 Bucket**: `tbyte-terragrunt-state-083777493764`
- **Versioning**: Enabled for state history
- **Encryption**: AES256 server-side encryption
- **Region**: eu-central-1

## Expected Output

```
📦 Creating S3 bucket for Terragrunt state
Account: 083777493764
Bucket: tbyte-terragrunt-state-083777493764
{
    "Location": "http://tbyte-terragrunt-state-083777493764.s3.amazonaws.com/"
}
✅ S3 bucket created: tbyte-terragrunt-state-083777493764
```

## Troubleshooting

**Error: Bucket already exists**
- This is normal if script was run before
- Verify bucket settings are correct

**Error: Access denied**
- Check AWS profile is set: `export AWS_PROFILE=17dec25`
- Verify IAM permissions include S3 operations

## Security Notes

- Bucket is private by default
- Only accessible by root account
- Versioning protects against state corruption
- Encryption protects state data at rest
