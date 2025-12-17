include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../../modules/argocd"
}

dependency "eks" {
  config_path = "../eks"
  
  mock_outputs = {
    cluster_name                       = "tbyte-dev"
    cluster_endpoint                   = "https://mock-endpoint"
    cluster_certificate_authority_data = "mock-ca-data"
    oidc_provider_arn                  = "arn:aws:iam::123456789012:oidc-provider/mock"
  }
  mock_outputs_allowed_terraform_commands = ["plan", "validate"]
}

inputs = {
  project                            = "tbyte"
  environment                        = "dev"
  cluster_name                       = dependency.eks.outputs.cluster_name
  cluster_endpoint                   = dependency.eks.outputs.cluster_endpoint
  cluster_certificate_authority_data = dependency.eks.outputs.cluster_certificate_authority_data
  oidc_provider_arn                  = dependency.eks.outputs.oidc_provider_arn
  
  argocd_namespace = "argocd"
  git_repo_url     = "https://github.com/chiju/aws-multi-account-lab.git"
  
  # GitHub App credentials (passed via TF_VAR environment variables from workflow)
  github_app_id              = get_env("TF_VAR_github_app_id", "")
  github_app_installation_id = get_env("TF_VAR_github_app_installation_id", "")
  github_app_private_key     = get_env("TF_VAR_github_app_private_key", "")
}
