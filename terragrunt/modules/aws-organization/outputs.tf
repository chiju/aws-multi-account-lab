output "organization_id" {
  value = aws_organizations_organization.main.id
}

output "root_id" {
  value = aws_organizations_organization.main.roots[0].id
}

output "master_account_id" {
  value = aws_organizations_organization.main.master_account_id
}
