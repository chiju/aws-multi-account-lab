terraform {
  source = "../../../modules/secrets"
}

include "root" {
  path = find_in_parent_folders("root.hcl")
}

inputs = {
  cluster_name = "tbyte-dev"
  environment  = "dev"
  aws_region   = "eu-central-1"
  project      = "x-clone"
}
