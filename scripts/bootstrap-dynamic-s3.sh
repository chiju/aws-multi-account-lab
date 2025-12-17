#!/bin/bash

# Dynamic S3 bootstrap for all accounts in organization
set -e

export AWS_PROFILE=17dec25
REGION="eu-central-1"
ROOT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)

echo "🚀 Dynamic multi-account S3 bootstrap"
echo "Root account: $ROOT_ACCOUNT"
echo "Region: $REGION"
echo ""

# Get all accounts in organization (excluding root)
echo "🔍 Discovering accounts in organization..."
ACCOUNTS=$(aws organizations list-accounts \
    --query 'Accounts[?Id!=`'$ROOT_ACCOUNT'`].[Id,Name]' \
    --output text)

if [ -z "$ACCOUNTS" ]; then
    echo "❌ No member accounts found in organization"
    exit 1
fi

echo "📋 Found accounts:"
echo "$ACCOUNTS" | while read account_id account_name; do
    echo "   $account_id ($account_name)"
done
echo ""

# Function to create S3 bucket for an account
create_s3_bucket() {
    local account_id=$1
    local account_name=$2
    local bucket_name="tbyte-terragrunt-state-${account_id}"
    
    echo "📦 Creating S3 bucket for $account_name"
    echo "   Account: $account_id"
    echo "   Bucket: $bucket_name"
    
    # Assume OrganizationAccountAccessRole in target account
    local role_arn="arn:aws:iam::${account_id}:role/OrganizationAccountAccessRole"
    local session_name="bootstrap-s3-$(echo $account_name | tr '[:upper:]' '[:lower:]' | tr -d ' -')"
    
    # Get temporary credentials
    local creds=$(aws sts assume-role \
        --role-arn $role_arn \
        --role-session-name $session_name \
        --output json 2>/dev/null)
    
    if [ $? -ne 0 ]; then
        echo "   ❌ Failed to assume role in $account_name ($account_id)"
        echo "   💡 Make sure OrganizationAccountAccessRole exists"
        return 1
    fi
    
    local access_key=$(echo $creds | jq -r '.Credentials.AccessKeyId')
    local secret_key=$(echo $creds | jq -r '.Credentials.SecretAccessKey')
    local session_token=$(echo $creds | jq -r '.Credentials.SessionToken')
    
    # Check if bucket already exists
    local bucket_exists=$(AWS_ACCESS_KEY_ID=$access_key \
        AWS_SECRET_ACCESS_KEY=$secret_key \
        AWS_SESSION_TOKEN=$session_token \
        aws s3api head-bucket --bucket $bucket_name 2>/dev/null && echo "true" || echo "false")
    
    if [ "$bucket_exists" = "true" ]; then
        echo "   ℹ️  Bucket already exists: $bucket_name"
        echo ""
        return 0
    fi
    
    # Create bucket
    AWS_ACCESS_KEY_ID=$access_key \
    AWS_SECRET_ACCESS_KEY=$secret_key \
    AWS_SESSION_TOKEN=$session_token \
    aws s3api create-bucket \
        --bucket $bucket_name \
        --region $REGION \
        --create-bucket-configuration LocationConstraint=$REGION
    
    # Enable versioning
    AWS_ACCESS_KEY_ID=$access_key \
    AWS_SECRET_ACCESS_KEY=$secret_key \
    AWS_SESSION_TOKEN=$session_token \
    aws s3api put-bucket-versioning \
        --bucket $bucket_name \
        --versioning-configuration Status=Enabled
    
    # Enable encryption
    AWS_ACCESS_KEY_ID=$access_key \
    AWS_SECRET_ACCESS_KEY=$secret_key \
    AWS_SESSION_TOKEN=$session_token \
    aws s3api put-bucket-encryption \
        --bucket $bucket_name \
        --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'
    
    echo "   ✅ S3 bucket created: $bucket_name"
    echo ""
}

# Create buckets for each account
SUCCESS_COUNT=0
TOTAL_COUNT=0

echo "$ACCOUNTS" | while read account_id account_name; do
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    if create_s3_bucket "$account_id" "$account_name"; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    fi
done

echo "🎉 Dynamic S3 bootstrap complete!"
echo ""
echo "📊 Summary:"
echo "   Accounts processed: $(echo "$ACCOUNTS" | wc -l)"
echo "   Buckets created/verified: $(echo "$ACCOUNTS" | wc -l)"
echo ""
echo "📋 Bucket naming pattern: tbyte-terragrunt-state-{ACCOUNT_ID}"
echo "🔧 Features enabled: Versioning, AES256 encryption"
