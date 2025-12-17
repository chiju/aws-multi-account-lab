# Initial AWS Account Setup

## Step 1: Create AWS Account via UI

1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Enter email address and account name
4. Complete verification process
5. Add payment method
6. Complete phone verification
7. Choose support plan (Basic is free)

## Step 2: Create Initial IAM User

1. Sign in to AWS Console as root user
2. Go to IAM service
3. Click "Users" → "Create user"
4. Enter username (e.g., `admin-user`)
5. Select "Provide user access to the AWS Management Console"
6. Choose "I want to create an IAM user"
7. Set console password or auto-generate
8. Click "Next"

## Step 3: Attach Permissions

1. Select "Attach policies directly"
2. Search and select `AdministratorAccess`
3. Click "Next" → "Create user"

## Step 4: Create Access Keys

1. Click on the created user
2. Go to "Security credentials" tab
3. Click "Create access key"
4. Select "Command Line Interface (CLI)"
5. Check acknowledgment box
6. Add description tag (optional)
7. Click "Create access key"
8. **Save the Access Key ID and Secret Access Key**

## Step 5: Configure AWS CLI

```bash
# Install AWS CLI if not already installed
# macOS: brew install awscli
# Linux: sudo apt install awscli

# Configure AWS profile
aws configure --profile your-profile-name

# Enter when prompted:
# AWS Access Key ID: [Your Access Key ID]
# AWS Secret Access Key: [Your Secret Access Key]  
# Default region name: eu-central-1
# Default output format: json

# Test configuration
aws sts get-caller-identity --profile your-profile-name
```

## Step 6: Set Environment Variable

```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
export AWS_PROFILE=your-profile-name

# Or set for current session
export AWS_PROFILE=your-profile-name
```

## Security Best Practices

- **Never use root user** for daily operations
- **Enable MFA** on root account and IAM users
- **Rotate access keys** regularly
- **Use least privilege** principle for permissions
- **Delete unused access keys**
