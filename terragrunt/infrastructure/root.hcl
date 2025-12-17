remote_state {
  backend = "s3"
  config = {
    encrypt = true
    bucket  = "tbyte-terragrunt-state-${get_aws_account_id()}"
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
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
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

# Kubernetes provider configuration (conditional)
provider "kubernetes" {
  host                   = try(var.cluster_endpoint, "")
  cluster_ca_certificate = try(base64decode(var.cluster_certificate_authority_data), "")
  
  dynamic "exec" {
    for_each = try(var.cluster_name, "") != "" && try(var.cluster_endpoint, "") != "" && !can(regex("mock", var.cluster_endpoint)) ? [1] : []
    content {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args = [
        "eks",
        "get-token",
        "--cluster-name",
        var.cluster_name,
        "--region",
        var.aws_region
      ]
    }
  }
}

# Helm provider configuration (conditional)
provider "helm" {
  kubernetes {
    host                   = try(var.cluster_endpoint, "")
    cluster_ca_certificate = try(base64decode(var.cluster_certificate_authority_data), "")
    
    dynamic "exec" {
      for_each = try(var.cluster_name, "") != "" && try(var.cluster_endpoint, "") != "" && !can(regex("mock", var.cluster_endpoint)) ? [1] : []
      content {
        api_version = "client.authentication.k8s.io/v1beta1"
        command     = "aws"
        args = [
          "eks",
          "get-token",
          "--cluster-name",
          var.cluster_name,
          "--region",
          var.aws_region
        ]
      }
    }
  }
}
EOF
}

inputs = {
  aws_region  = "eu-central-1"
  project     = "tbyte"
}
