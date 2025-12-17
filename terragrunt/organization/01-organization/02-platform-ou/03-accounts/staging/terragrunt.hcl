include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../../../../modules/aws-account"
}

dependency "platform_ou" {
  config_path = "../../"
  
  mock_outputs = {
    id = "ou-mock"
  }
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
