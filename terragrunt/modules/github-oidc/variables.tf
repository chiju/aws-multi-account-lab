variable "role_name" {
  description = "Name of the GitHub Actions IAM role"
  type        = string
  default     = "GitHubActionsRole"
}

variable "github_repo" {
  description = "GitHub repository (owner/repo)"
  type        = string
}

variable "policy_arns" {
  description = "List of policy ARNs to attach to the role"
  type        = list(string)
  default     = ["arn:aws:iam::aws:policy/AdministratorAccess"]
}

# Variables that root.hcl expects
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

# Optional variables for root.hcl compatibility
variable "project" {
  description = "Project name"
  type        = string
  default     = "tbyte"
}

variable "cluster_name" {
  description = "EKS cluster name (not used in OIDC)"
  type        = string
  default     = ""
}

variable "cluster_endpoint" {
  description = "EKS cluster endpoint (not used in OIDC)"
  type        = string
  default     = ""
}

variable "cluster_certificate_authority_data" {
  description = "EKS cluster CA data (not used in OIDC)"
  type        = string
  default     = ""
}
