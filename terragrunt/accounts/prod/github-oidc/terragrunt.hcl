terraform {
  source = "../../../modules/github-oidc"
}

include "root" {
  path = find_in_parent_folders("root.hcl")
}

inputs = {
  use_account_info = true
  github_repo      = "chiju/aws-multi-account-lab"
  environment      = "prod"
}
