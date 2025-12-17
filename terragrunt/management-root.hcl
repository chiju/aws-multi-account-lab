terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

remote_state {
  backend = "s3"
  config = {
    encrypt = true
    bucket  = "tbyte-terragrunt-state-083777493764"
    key     = "${path_relative_to_include()}/terraform.tfstate"
    region  = "eu-central-1"
  }
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project
      ManagedBy   = "terragrunt"
    }
  }
}
EOF
}

inputs = {
  aws_region  = "eu-central-1"
  environment = "management"
  project     = "tbyte"
}
