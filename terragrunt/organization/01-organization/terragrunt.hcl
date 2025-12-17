include "root" {
  path = find_in_parent_folders("management-management-root.hcl")
}

terraform {
  source = "../../modules/aws-organization"
}

inputs = {
  # No inputs needed - uses defaults
}
