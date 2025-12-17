#!/bin/bash

set -e

AWS_PROFILE="17dec25"

echo "🔐 Deploying OIDC to all member accounts..."

cd /Users/c.chandran/lab/2025/aws-multi-account-lab

for ENV in dev staging prod; do
    case $ENV in
        dev) ACCOUNT_ID="575491070504" ;;
        staging) ACCOUNT_ID="240783391550" ;;
        prod) ACCOUNT_ID="586643076348" ;;
    esac
    
    echo ""
    echo "🏗️  Deploying OIDC to $ENV account ($ACCOUNT_ID)..."
    
    cd terragrunt/organization/01-organization/02-platform-ou/03-accounts/$ENV/github-oidc
    
    # Assume role in target account
    CREDS=$(aws sts assume-role \
        --role-arn "arn:aws:iam::${ACCOUNT_ID}:role/OrganizationAccountAccessRole" \
        --role-session-name "deploy-oidc-${ENV}" \
        --profile $AWS_PROFILE \
        --output json)
    
    export AWS_ACCESS_KEY_ID=$(echo $CREDS | jq -r '.Credentials.AccessKeyId')
    export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | jq -r '.Credentials.SecretAccessKey')
    export AWS_SESSION_TOKEN=$(echo $CREDS | jq -r '.Credentials.SessionToken')
    
    # Deploy OIDC
    terragrunt apply -auto-approve
    
    # Get role ARN and add to GitHub secrets
    ROLE_ARN=$(terragrunt output -raw role_arn)
    SECRET_NAME="AWS_ROLE_ARN_$(echo $ENV | tr '[:lower:]' '[:upper:]')"
    
    echo "   🔐 Adding GitHub secret: $SECRET_NAME"
    gh secret set "$SECRET_NAME" --body "$ROLE_ARN" --repo "chiju/aws-multi-account-lab"
    
    echo "   ✅ $ENV account complete: $ROLE_ARN"
    
    # Unset credentials
    unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
    
    cd ../../../../../../..
done

echo ""
echo "🎉 Multi-account OIDC deployment complete!"
