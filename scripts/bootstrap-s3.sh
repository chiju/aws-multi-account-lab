#!/bin/bash

# Bootstrap S3 bucket for Terragrunt state
set -e

export AWS_PROFILE=17dec25
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="tbyte-terragrunt-state-${ACCOUNT_ID}"
REGION="eu-central-1"

echo "📦 Creating S3 bucket for Terragrunt state"
echo "Account: $ACCOUNT_ID"
echo "Bucket: $BUCKET_NAME"

# Create bucket
aws s3api create-bucket \
    --bucket $BUCKET_NAME \
    --region $REGION \
    --create-bucket-configuration LocationConstraint=$REGION

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket $BUCKET_NAME \
    --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
    --bucket $BUCKET_NAME \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'

echo "✅ S3 bucket created: $BUCKET_NAME"
