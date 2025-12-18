output "x_clone_secret_arn" {
  description = "ARN of the X Clone secrets in AWS Secrets Manager"
  value       = aws_secretsmanager_secret.x_clone_secrets.arn
}

output "x_clone_secret_name" {
  description = "Name of the X Clone secrets in AWS Secrets Manager"
  value       = aws_secretsmanager_secret.x_clone_secrets.name
}
