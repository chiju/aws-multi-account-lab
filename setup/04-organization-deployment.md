# Organization Deployment

## Overview

Deploy the AWS multi-account organization structure using the GitHub Actions pipeline with Terragrunt plan file workflow.

## Prerequisites

- GitHub OIDC setup completed (see 03-github-oidc-setup.md)
- Repository: `chiju/aws-multi-account-lab`
- GitHub CLI authenticated
- Terragrunt 0.96.0+ for plan file support

## Step 1: Verify Pipeline Configuration

```bash
# Check workflow file exists
ls -la .github/workflows/organization-setup.yml

# Verify GitHub secrets
gh secret list --repo chiju/aws-multi-account-lab
```

## Step 2: Test Organization Planning

```bash
# Trigger plan-only workflow to review changes
gh workflow run organization-setup.yml -f action=plan

# Monitor pipeline execution
gh run list --workflow=organization-setup.yml --limit=1

# View detailed logs
gh run view [RUN_ID] --log
```

## Step 3: Deploy Organization Structure

```bash
# Deploy organization with plan file workflow
gh workflow run organization-setup.yml -f action=apply

# Monitor deployment progress
gh run list --workflow=organization-setup.yml --limit=1
```

## What Gets Deployed

### Organization Structure
- **AWS Organization**: Root organization container
- **Platform OU**: Organizational unit for platform accounts
- **Dev Account**: aws-multi-account-lab-dev (575491070504)
- **Staging Account**: aws-multi-account-lab-staging (240783391550)  
- **Prod Account**: aws-multi-account-lab-prod (586643076348)

### Pipeline Features
- **Plan Files**: Generated for each Terragrunt unit
- **Artifact Upload**: Plan files stored for audit trail
- **Immutable Apply**: Uses exact same plans that were generated
- **Account IDs**: Displayed at completion for reference

## Expected Output

```
🏗️ Organization Setup Started
Action: apply

📋 Plan with Output Files:
   ✅ Organization (0 to add, 0 to change, 0 to destroy)
   ✅ Platform OU (0 to add, 0 to change, 0 to destroy)
   ✅ Dev Account (0 to add, 1 to change, 0 to destroy)
   ✅ Staging Account (0 to add, 1 to change, 0 to destroy)
   ✅ Prod Account (0 to add, 1 to change, 0 to destroy)

📦 Upload Plan Files:
   With the provided path, there will be 5 files uploaded
   Artifact terraform-plans.zip successfully finalized

🚀 Apply Exact Plans:
   aws_organizations_account.account: Modifying... [id=575491070504]
   aws_organizations_account.account: Modifying... [id=240783391550]
   aws_organizations_account.account: Modifying... [id=586643076348]
   Apply complete! Resources: 0 added, 3 changed, 0 destroyed

📋 Created Account IDs:
   Dev: 575491070504
   Staging: 240783391550
   Prod: 586643076348

✅ Organization deployment complete!
```

## Step 4: Verify Organization Structure

```bash
# List organization accounts
aws organizations list-accounts --profile 17dec25

# Check organizational units
aws organizations list-organizational-units-for-parent --parent-id r-wcum --profile 17dec25

# Verify account placement
aws organizations list-accounts-for-parent --parent-id ou-wcum-c1d2h00s --profile 17dec25
```

## Pipeline Workflow Details

### Plan File Process
1. **Plan Generation**: `terragrunt plan --all --out-dir /tmp/terragrunt-plans`
2. **File Upload**: Plan files stored as GitHub artifacts
3. **Exact Apply**: `terragrunt apply --all --out-dir /tmp/terragrunt-plans`

### Safety Features
- **Immutable Plans**: Apply uses exact same plans that were reviewed
- **Audit Trail**: Plan files downloadable for compliance
- **No Drift**: Prevents changes between plan and apply phases
- **Mock Outputs**: Used during planning when dependencies don't exist yet

## Troubleshooting

**Error: "flag `--out` is not a valid global flag"**
- Upgrade to Terragrunt 0.96.0+
- Use `--out-dir` instead of `-out` flag
- Verify correct syntax: `terragrunt plan --all --out-dir`

**Error: "No variable named dependency"**
- Add mock outputs to dependency blocks
- Verify dependency paths are correct
- Check that parent resources exist

**Error: "No files were found with the provided path"**
- Terragrunt version doesn't support plan files with run-all
- Use correct path pattern: `/tmp/terragrunt-plans/**/*.tfplan`
- Verify plan files were actually generated

## Configuration Files Modified

### Terragrunt Account Configs
```hcl
# terragrunt/organization/01-organization/02-platform-ou/03-accounts/*/terragrunt.hcl
dependency "platform_ou" {
  config_path = "../.."
  
  mock_outputs = {
    id = "ou-mock-platform"
  }
}
```

### GitHub Workflow
```yaml
# .github/workflows/organization-setup.yml
- name: Plan with Output Files
  run: terragrunt plan --all --out-dir /tmp/terragrunt-plans --non-interactive

- name: Apply Exact Plans  
  run: terragrunt apply --all --out-dir /tmp/terragrunt-plans --non-interactive
```

## Security Notes

- **Account Safety**: `close_on_deletion = false` prevents accidental closure
- **OIDC Authentication**: No long-lived credentials in GitHub
- **Least Privilege**: IAM roles with minimal required permissions
- **Audit Trail**: All changes tracked through plan files

## Next Steps

After organization deployment is complete:
1. Set up OIDC in each sub-account for infrastructure deployment
2. Configure GitHub secrets for multi-account access
3. Deploy infrastructure (VPC, EKS, RDS) to each account
4. Set up application deployment pipelines
5. Configure monitoring and observability across accounts
