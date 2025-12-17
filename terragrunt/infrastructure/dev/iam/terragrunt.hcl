include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../../modules/iam"
}

dependency "eks" {
  config_path = "../eks"
  
  mock_outputs = {
    cluster_name           = "tbyte-dev"
    cluster_oidc_issuer_url = "https://oidc.eks.eu-central-1.amazonaws.com/id/MOCK"
  }
  mock_outputs_allowed_terraform_commands = ["plan", "validate"]
}

dependency "rds" {
  config_path = "../rds"
  
  mock_outputs = {
    rds_secret_arn = "arn:aws:secretsmanager:eu-central-1:575491070504:secret:mock-secret"
  }
  mock_outputs_allowed_terraform_commands = ["plan", "validate"]
}

inputs = {
  project                 = "tbyte"
  environment             = "dev"
  cluster_name            = dependency.eks.outputs.cluster_name
  cluster_oidc_issuer_url = dependency.eks.outputs.cluster_oidc_issuer_url
  
  # RDS secret ARN from RDS module
  rds_secret_arn = dependency.rds.outputs.rds_secret_arn
}
