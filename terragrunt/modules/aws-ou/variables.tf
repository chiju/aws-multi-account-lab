variable "name" {
  description = "Name of the organizational unit"
  type        = string
}

variable "parent_id" {
  description = "Parent ID (root or another OU)"
  type        = string
}

variable "tags" {
  description = "Tags for the OU"
  type        = map(string)
  default     = {}
}
