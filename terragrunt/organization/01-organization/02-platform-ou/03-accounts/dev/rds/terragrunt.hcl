include "root" {
  path = find_in_parent_folders("member-account-root.hcl")
}

terraform {
  source = "../../../../../../modules/rds"
}

dependency "vpc" {
  config_path = "../vpc"
}

inputs = {
  environment  = "dev"
  cluster_name = "tbyte-dev"
  
  vpc_id             = dependency.vpc.outputs.vpc_id
  private_subnet_ids = dependency.vpc.outputs.private_subnet_ids
  
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  engine_version    = "16.3"
}
