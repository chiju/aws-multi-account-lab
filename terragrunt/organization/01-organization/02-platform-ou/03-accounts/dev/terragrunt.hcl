include "root" {
  path = find_in_parent_folders("management-root.hcl")
}

terraform {
  source = "../../../../../modules/aws-account"
}

dependency "platform_ou" {
  config_path = "../"
  
  mock_outputs = {
    id = "ou-mock"
  }
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
