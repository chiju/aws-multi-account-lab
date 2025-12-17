include "root" {
  path = find_in_parent_folders("member-account-root.hcl")
}

terraform {
  source = "../../../../../../modules/argocd"
}

dependency "eks" {
  config_path = "../eks"
}

inputs = {
  environment  = "dev"
  cluster_name = "tbyte-dev"
  
  cluster_endpoint                   = dependency.eks.outputs.cluster_endpoint
  cluster_certificate_authority_data = dependency.eks.outputs.cluster_certificate_authority_data
}
