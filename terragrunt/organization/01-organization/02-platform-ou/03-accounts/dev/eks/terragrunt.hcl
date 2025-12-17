include "root" {
  path = find_in_parent_folders("member-account-root.hcl")
}

terraform {
  source = "../../../../../../modules/eks"
}

dependency "vpc" {
  config_path = "../vpc"
}

inputs = {
  project            = "tbyte"
  environment  = "dev"
  cluster_name = "tbyte-dev"
  
  vpc_id             = dependency.vpc.outputs.vpc_id
  private_subnet_ids = dependency.vpc.outputs.private_subnet_ids
  
  node_instance_types = ["t3.medium"]
  node_desired_size   = 2
  node_min_size       = 1
  node_max_size       = 4
}
