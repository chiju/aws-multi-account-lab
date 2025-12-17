# GitHub OIDC Setup

## Overview

Set up GitHub OIDC provider and IAM role for secure pipeline authentication without access keys.

## Prerequisites

- S3 state backend created (see 02-s3-state-backend.md)
- GitHub CLI installed and authenticated
- AWS CLI configured with profile `17dec25`
- Repository: `chiju/aws-multi-account-lab`

## Step 1: Run OIDC Setup Script

```bash
# Navigate to project directory
cd /Users/c.chandran/lab/2025/aws-multi-account-lab

# Execute OIDC setup script
./scripts/setup-oidc.sh
```

## Step 2: Verify OIDC Resources

```bash
# Check OIDC provider exists
aws iam list-open-id-connect-providers --profile 17dec25

# Check GitHub Actions role exists
aws iam get-role --role-name GitHubActionsRole --profile 17dec25

# Verify GitHub secret was added
gh secret list --repo chiju/aws-multi-account-lab
```

## What the Script Creates

### AWS Resources
- **OIDC Provider**: `arn:aws:iam::083777493764:oidc-provider/token.actions.githubusercontent.com`
- **IAM Role**: `GitHubActionsRole`
- **Policy**: AdministratorAccess attached to role
- **Trust Policy**: Allows GitHub Actions from `chiju/aws-multi-account-lab` repo

### GitHub Secret
- **Secret Name**: `AWS_ROLE_ARN_ROOT`
- **Secret Value**: `arn:aws:iam::083777493764:role/GitHubActionsRole`

## Expected Output

```
🔐 Setting up GitHub OIDC for AWS
1️⃣ Creating OIDC provider and role...
[Terraform output showing resource creation]
2️⃣ Getting role ARN...
Role ARN: arn:aws:iam::083777493764:role/GitHubActionsRole
3️⃣ Adding to GitHub secrets...
✅ OIDC setup complete!

📋 Summary:
   Role ARN: arn:aws:iam::083777493764:role/GitHubActionsRole
   GitHub Secret: AWS_ROLE_ARN_ROOT

🚀 Now you can use the Organization Setup pipeline!
```

## Step 3: Test Pipeline Authentication

1. Go to GitHub repository → Actions
2. Select "Organization Setup" workflow
3. Click "Run workflow"
4. Choose "plan" action
5. Verify pipeline can authenticate using OIDC

## Troubleshooting

**Error: GitHub CLI not authenticated**
```bash
gh auth login
```

**Error: Repository not found**
- Verify repository name in script: `chiju/aws-multi-account-lab`
- Check GitHub CLI has access to repository

**Error: Terragrunt apply fails**
- Ensure S3 bucket exists (run bootstrap script first)
- Check AWS profile is set: `export AWS_PROFILE=17dec25`

## Security Benefits

- ✅ **No long-lived credentials** in GitHub
- ✅ **Temporary tokens** only (1 hour max)
- ✅ **Repository-specific** access
- ✅ **AWS best practice** for CI/CD

## Next Steps

After OIDC setup is complete:
1. Run Organization Setup pipeline to create AWS accounts
2. Set up OIDC in each sub-account for infrastructure deployment
3. Deploy EKS clusters and applications using secure authentication
