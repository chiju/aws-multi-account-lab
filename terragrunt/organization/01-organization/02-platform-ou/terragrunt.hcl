include "root" {
  path = find_in_parent_folders("management-root.hcl")
}

terraform {
  source = "../../../modules/aws-ou"
}

dependency "organization" {
  config_path = "../"
  
  mock_outputs = {
    root_id = "r-mock"
  }
}

inputs = {
  name      = "Platform"
  parent_id = dependency.organization.outputs.root_id
  
  tags = {
    Purpose = "Platform environments"
  }
}
