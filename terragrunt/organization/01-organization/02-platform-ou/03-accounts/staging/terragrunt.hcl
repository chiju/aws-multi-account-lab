include "root" {
  path = find_in_parent_folders("management-root.hcl")
}

dependency "platform_ou" {
  config_path = "../.."
}

terraform {
  source = "../../../../../modules/aws-account"
}

inputs = {
  name      = "aws-multi-account-lab-staging"
  email     = "chijudec25+staging@gmail.com"
  parent_id = dependency.platform_ou.outputs.id
  
  tags = {
    Environment = "staging"
    Purpose     = "Staging workloads"
  }
}
