include "root" {
  path = find_in_parent_folders("member-account-root.hcl")
}

terraform {
  source = "../../../../../../modules/iam"
}

dependency "eks" {
  config_path = "../eks"
}

inputs = {
  project            = "tbyte"
  environment  = "dev"
  cluster_name = "tbyte-dev"
  
  oidc_provider_arn = dependency.eks.outputs.oidc_provider_arn
}
