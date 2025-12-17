resource "aws_organizations_account" "account" {
  name      = var.name
  email     = var.email
  parent_id = var.parent_id
  
  tags = var.tags
  
  lifecycle {
    ignore_changes = [role_name]
  }
}
