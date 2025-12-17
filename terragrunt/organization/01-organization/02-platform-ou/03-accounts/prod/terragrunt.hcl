include "root" {
  path = find_in_parent_folders("management-root.hcl")
}

dependency "platform_ou" {
  config_path = "../.."
  
  mock_outputs = {
    id = "ou-mock-platform"
  }
}

terraform {
  source = "../../../../../modules/aws-account"
}

inputs = {
  name      = "aws-multi-account-lab-prod"
  email     = "chijudec25+prod@gmail.com"
  parent_id = dependency.platform_ou.outputs.id
  
  tags = {
    Environment = "production"
    Purpose     = "Production workloads"
  }
}
