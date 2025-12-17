#!/bin/bash

# Setup GitHub OIDC and add secrets
set -e

export AWS_PROFILE=17dec25
REPO="chiju/aws-multi-account-lab"

echo "🔐 Setting up GitHub OIDC for AWS"

# 1. Deploy OIDC setup
echo "1️⃣ Creating OIDC provider and role..."
cd terragrunt/organization/00-github-oidc
terragrunt apply --auto-approve

# 2. Get role ARN
echo "2️⃣ Getting role ARN..."
ROLE_ARN=$(terragrunt output -raw role_arn)
echo "Role ARN: $ROLE_ARN"

# 3. Add to GitHub secrets
echo "3️⃣ Adding to GitHub secrets..."
gh secret set AWS_ROLE_ARN_ROOT --body "$ROLE_ARN" --repo "$REPO"

echo "✅ OIDC setup complete!"
echo ""
echo "📋 Summary:"
echo "   Role ARN: $ROLE_ARN"
echo "   GitHub Secret: AWS_ROLE_ARN_ROOT"
echo ""
echo "🚀 Now you can use the Organization Setup pipeline!"
