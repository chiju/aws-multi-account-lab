variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "management"
}

variable "project" {
  description = "Project name"
  type        = string
  default     = "tbyte"
}

variable "name" {
  description = "Name of the AWS account"
  type        = string
}

variable "email" {
  description = "Email address for the AWS account"
  type        = string
}

variable "parent_id" {
  description = "Parent organizational unit ID"
  type        = string
}
