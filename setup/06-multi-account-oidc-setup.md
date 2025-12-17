# Multi-Account OIDC Setup

## Overview

Set up GitHub OIDC providers and IAM roles in all member accounts (dev, staging, prod) for secure pipeline authentication.

## Prerequisites

- Organization and member accounts created (see 04-organization-deployment.md)
- S3 state buckets in all accounts (see 05-multi-account-s3-setup.md)
- GitHub CLI installed and authenticated
- AWS CLI configured with profile `17dec25`
- Repository: `chiju/aws-multi-account-lab`

## Step 1: Deploy OIDC to All Accounts

```bash
# Navigate to project directory
cd /Users/c.chandran/lab/2025/aws-multi-account-lab

# Execute multi-account OIDC deployment
./scripts/deploy-multi-account-oidc.sh
```

## Step 2: Verify OIDC Resources

```bash
# Check OIDC providers and roles in all accounts
for ENV in dev staging prod; do
    case $ENV in
        dev) ACCOUNT_ID="575491070504" ;;
        staging) ACCOUNT_ID="240783391550" ;;
        prod) ACCOUNT_ID="586643076348" ;;
    esac
    
    echo "Checking $ENV account..."
    
    CREDS=$(aws sts assume-role \
        --role-arn arn:aws:iam::${ACCOUNT_ID}:role/OrganizationAccountAccessRole \
        --role-session-name check-oidc \
        --profile 17dec25 \
        --output json)
    
    ACCESS_KEY=$(echo $CREDS | jq -r '.Credentials.AccessKeyId')
    SECRET_KEY=$(echo $CREDS | jq -r '.Credentials.SecretAccessKey')
    SESSION_TOKEN=$(echo $CREDS | jq -r '.Credentials.SessionToken')
    
    AWS_ACCESS_KEY_ID=$ACCESS_KEY \
    AWS_SECRET_ACCESS_KEY=$SECRET_KEY \
    AWS_SESSION_TOKEN=$SESSION_TOKEN \
    aws iam list-open-id-connect-providers
    
    AWS_ACCESS_KEY_ID=$ACCESS_KEY \
    AWS_SECRET_ACCESS_KEY=$SECRET_KEY \
    AWS_SESSION_TOKEN=$SESSION_TOKEN \
    aws iam get-role --role-name "GitHubActionsRole-${ENV}-${ACCOUNT_ID}"
done

# Verify GitHub secrets
gh secret list --repo chiju/aws-multi-account-lab | grep AWS_ROLE_ARN
```

## What the Script Creates

### Per Account Resources

**Dev Account (575491070504)**
- **OIDC Provider**: `arn:aws:iam::575491070504:oidc-provider/token.actions.githubusercontent.com`
- **IAM Role**: `GitHubActionsRole-dev-575491070504`
- **Policy**: AdministratorAccess
- **State**: `tbyte-terragrunt-state-575491070504/dev/github-oidc/terraform.tfstate`

**Staging Account (240783391550)**
- **OIDC Provider**: `arn:aws:iam::240783391550:oidc-provider/token.actions.githubusercontent.com`
- **IAM Role**: `GitHubActionsRole-staging-240783391550`
- **Policy**: AdministratorAccess
- **State**: `tbyte-terragrunt-state-240783391550/staging/github-oidc/terraform.tfstate`

**Prod Account (586643076348)**
- **OIDC Provider**: `arn:aws:iam::586643076348:oidc-provider/token.actions.githubusercontent.com`
- **IAM Role**: `GitHubActionsRole-prod-586643076348`
- **Policy**: AdministratorAccess
- **State**: `tbyte-terragrunt-state-586643076348/prod/github-oidc/terraform.tfstate`

### GitHub Secrets

- **AWS_ROLE_ARN_DEV**: `arn:aws:iam::575491070504:role/GitHubActionsRole-dev-575491070504`
- **AWS_ROLE_ARN_STAGING**: `arn:aws:iam::240783391550:role/GitHubActionsRole-staging-240783391550`
- **AWS_ROLE_ARN_PROD**: `arn:aws:iam::586643076348:role/GitHubActionsRole-prod-586643076348`

## Expected Output

```
🔐 Deploying OIDC to all member accounts...

🏗️  Deploying OIDC to dev account (575491070504)...
   🔐 Adding GitHub secret: AWS_ROLE_ARN_DEV
   ✅ dev account complete: arn:aws:iam::575491070504:role/GitHubActionsRole-dev-575491070504

🏗️  Deploying OIDC to staging account (240783391550)...
   🔐 Adding GitHub secret: AWS_ROLE_ARN_STAGING
   ✅ staging account complete: arn:aws:iam::240783391550:role/GitHubActionsRole-staging-240783391550

🏗️  Deploying OIDC to prod account (586643076348)...
   🔐 Adding GitHub secret: AWS_ROLE_ARN_PROD
   ✅ prod account complete: arn:aws:iam::586643076348:role/GitHubActionsRole-prod-586643076348

🎉 Multi-account OIDC deployment complete!
```

## Architecture

```
terragrunt/
├── modules/
│   └── github-oidc/              # Reusable OIDC module
│       ├── main.tf               # OIDC provider + IAM role
│       ├── variables.tf          # Module inputs
│       └── outputs.tf            # Role ARN output
├── member-account-root.hcl       # Shared config for member accounts
└── organization/
    └── 01-organization/
        └── 02-platform-ou/
            └── 03-accounts/
                ├── dev/
                │   └── github-oidc/
                │       └── terragrunt.hcl
                ├── staging/
                │   └── github-oidc/
                │       └── terragrunt.hcl
                └── prod/
                    └── github-oidc/
                        └── terragrunt.hcl
```

## How It Works

1. **Cross-Account Access**: Script assumes `OrganizationAccountAccessRole` in each member account
2. **Dynamic State**: Each account uses its own S3 bucket via `get_aws_account_id()`
3. **Role Naming**: Includes environment and account ID for uniqueness
4. **GitHub Integration**: Automatically creates secrets with role ARNs

## Troubleshooting

**Error: Unable to assume role**
```bash
# Verify OrganizationAccountAccessRole exists
aws iam get-role --role-name OrganizationAccountAccessRole --profile 17dec25
```

**Error: S3 bucket not found**
```bash
# Run S3 bootstrap first
./scripts/bootstrap-dynamic-s3.sh
```

**Error: GitHub CLI not authenticated**
```bash
gh auth login
```

## Security Benefits

- ✅ **No long-lived credentials** in GitHub
- ✅ **Temporary tokens** only (1 hour max)
- ✅ **Repository-specific** access
- ✅ **Account isolation** with separate roles
- ✅ **State tracking** per account

## Next Steps

After OIDC setup is complete:
1. Deploy infrastructure to member accounts using GitHub Actions
2. Use environment-specific roles for deployments
3. Monitor role usage in CloudTrail
