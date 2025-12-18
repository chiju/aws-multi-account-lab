include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../../modules/rds"
}

dependency "vpc" {
  config_path = "../vpc"
  
  mock_outputs = {
    vpc_id             = "vpc-mock"
    vpc_cidr           = "10.0.0.0/16"
    private_subnet_ids = ["subnet-mock-1", "subnet-mock-2"]
  }
  mock_outputs_allowed_terraform_commands = ["plan", "validate"]
}

dependency "eks" {
  config_path = "../eks"
  
  mock_outputs = {
    cluster_name = "tbyte-dev"
  }
  mock_outputs_allowed_terraform_commands = ["plan", "validate"]
}

inputs = {
  aws_region  = "eu-central-1"
  project     = "tbyte"
  environment = "dev"
  
  cluster_name = dependency.eks.outputs.cluster_name
  vpc_id       = dependency.vpc.outputs.vpc_id
  vpc_cidr     = dependency.vpc.outputs.vpc_cidr
  private_subnet_ids = dependency.vpc.outputs.private_subnet_ids
  
  # Database configuration
  db_name     = "tbyte"
  db_username = "postgres"
  
  # Instance configuration
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  
  # Security
  allowed_cidr_blocks = [dependency.vpc.outputs.vpc_cidr]
}
