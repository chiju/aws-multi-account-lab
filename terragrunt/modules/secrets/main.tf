# X Clone Application Secrets
resource "aws_secretsmanager_secret" "x_clone_secrets" {
  name                    = "${var.cluster_name}-x-clone-secrets"
  description             = "X Clone application secrets for ${var.cluster_name}"
  recovery_window_in_days = 0

  tags = {
    Name        = "${var.cluster_name}-x-clone-secrets"
    Environment = var.environment
    ManagedBy   = "terraform"
    Application = "x-clone"
  }
}

resource "aws_secretsmanager_secret_version" "x_clone_secrets" {
  secret_id = aws_secretsmanager_secret.x_clone_secrets.id
  secret_string = jsonencode({
    DATABASE_URL        = "PLACEHOLDER"
    NEXTAUTH_SECRET     = "PLACEHOLDER"
    NEXTAUTH_JWT_SECRET = "PLACEHOLDER"
    NEXTAUTH_URL        = "PLACEHOLDER"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# Grafana Admin Password
resource "aws_secretsmanager_secret" "grafana_admin_password" {
  name                    = "${var.cluster_name}-grafana-admin"
  description             = "Grafana admin password for ${var.cluster_name}"
  recovery_window_in_days = 0

  tags = {
    Name        = "${var.cluster_name}-grafana-admin"
    Environment = var.environment
    ManagedBy   = "terraform"
    Application = "grafana"
  }
}

resource "aws_secretsmanager_secret_version" "grafana_admin_password" {
  secret_id = aws_secretsmanager_secret.grafana_admin_password.id
  secret_string = jsonencode({
    admin-password = "PLACEHOLDER"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# Future applications can be added here with clear comments
