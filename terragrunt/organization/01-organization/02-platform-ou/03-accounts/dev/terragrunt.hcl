include "root" {

dependency "platform_ou" {
  config_path = "../.."
}
  path = find_in_parent_folders("management-root.hcl")
}

dependency "platform_ou" {
  config_path = "../.."
}

terraform {
  source = "../../../../../modules/aws-account"
}

inputs = {
  name      = "aws-multi-account-lab-dev"
  email     = "chijudec25+dev@gmail.com"
  parent_id = dependency.platform_ou.outputs.id
  
  tags = {
    Environment = "development"
    Purpose     = "Development workloads"
  }
}
