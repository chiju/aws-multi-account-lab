output "frontend_repository_url" {
  description = "URL of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_repository_url" {
  description = "URL of the backend ECR repository"
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_service_repository_url" {
  description = "URL of the frontend service ECR repository"
  value       = aws_ecr_repository.frontend_service.repository_url
}

output "x_clone_repository_url" {
  description = "URL of the X Clone ECR repository"
  value       = aws_ecr_repository.x_clone.repository_url
}

# Microservices ECR Repository URLs
output "user_service_repository_url" {
  description = "URL of the user service ECR repository"
  value       = aws_ecr_repository.user_service.repository_url
}

output "order_service_repository_url" {
  description = "URL of the order service ECR repository"
  value       = aws_ecr_repository.order_service.repository_url
}

output "inventory_service_repository_url" {
  description = "URL of the inventory service ECR repository"
  value       = aws_ecr_repository.inventory_service.repository_url
}

output "payment_service_repository_url" {
  description = "URL of the payment service ECR repository"
  value       = aws_ecr_repository.payment_service.repository_url
}

output "notification_service_repository_url" {
  description = "URL of the notification service ECR repository"
  value       = aws_ecr_repository.notification_service.repository_url
}

output "frontend_repository_name" {
  description = "Name of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.name
}

output "backend_repository_name" {
  description = "Name of the backend ECR repository"
  value       = aws_ecr_repository.backend.name
}

output "x_clone_repository_name" {
  description = "Name of the X Clone ECR repository"
  value       = aws_ecr_repository.x_clone.name
}
