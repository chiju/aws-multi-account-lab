include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../../modules/rds"
}

dependency "vpc" {
  config_path = "../vpc"
}

dependency "eks" {
  config_path = "../eks"
}

inputs = {
  aws_region  = "eu-central-1"
  project     = "tbyte"
  environment = "dev"
  
  cluster_name = dependency.eks.outputs.cluster_name
  vpc_id       = dependency.vpc.outputs.vpc_id
  subnet_ids   = dependency.vpc.outputs.private_subnet_ids
  
  # Database configuration
  db_name     = "tbyte"
  db_username = "postgres"
  
  # Instance configuration
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  
  # Security
  allowed_cidr_blocks = [dependency.vpc.outputs.vpc_cidr]
}
