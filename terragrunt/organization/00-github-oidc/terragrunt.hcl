include "root" {
  path = find_in_parent_folders("management-oidc-root.hcl")
}

terraform {
  source = "../../modules/github-oidc"
}

inputs = {
  role_name    = "GitHubActionsRole"
  github_repo  = "chiju/aws-multi-account-lab"
  policy_arns  = ["arn:aws:iam::aws:policy/AdministratorAccess"]
  environment  = "root"
}
