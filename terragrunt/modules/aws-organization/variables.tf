variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "root"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "tbyte"
}

variable "cluster_name" {
  description = "EKS cluster name (not used in organization)"
  type        = string
  default     = ""
}

variable "cluster_endpoint" {
  description = "EKS cluster endpoint (not used in organization)"
  type        = string
  default     = ""
}

variable "cluster_certificate_authority_data" {
  description = "EKS cluster CA data (not used in organization)"
  type        = string
  default     = ""
}
