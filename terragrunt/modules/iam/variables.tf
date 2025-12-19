variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "assume_role_arn" {
  description = "ARN of the role to assume for cross-account access"
  type        = string
  default     = null
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "namespace" {
  description = "Kubernetes namespace for the service account"
  type        = string
  default     = "default"
}

variable "service_account_name" {
  description = "Name of the Kubernetes service account"
  type        = string
  default     = "tbyte-backend"
}

variable "rds_secret_arn" {
  description = "ARN of the RDS secret in AWS Secrets Manager"
  type        = string
  default     = null
}

variable "cluster_oidc_issuer_url" {
  description = "OIDC issuer URL of the EKS cluster"
  type        = string
  default     = null
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "tbyte"
}

variable "skip_secret_lookup" {
  description = "Skip looking up secrets (useful during destroy operations)"
  type        = bool
  default     = false
}
