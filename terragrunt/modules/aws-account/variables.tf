variable "name" {
  description = "Name of the AWS account"
  type        = string
}

variable "email" {
  description = "Email for the AWS account"
  type        = string
}

variable "parent_id" {
  description = "Parent OU ID"
  type        = string
}

variable "tags" {
  description = "Tags for the account"
  type        = map(string)
  default     = {}
}
