# RDS PostgreSQL Database for microservices
# Production-ready with Multi-AZ, encryption, and automated backups

# DB Subnet Group for RDS
resource "aws_db_subnet_group" "postgres" {
  name       = "${var.cluster_name}-postgres-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "${var.cluster_name}-postgres-subnet-group"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Security Group for RDS
resource "aws_security_group" "postgres" {
  name_prefix = "${var.cluster_name}-postgres-"
  vpc_id      = var.vpc_id

  # Allow PostgreSQL access from EKS nodes (if EKS security group is provided)
  dynamic "ingress" {
    for_each = var.eks_cluster_security_group_id != null ? [1] : []
    content {
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      security_groups = [var.eks_cluster_security_group_id]
      description     = "PostgreSQL access from EKS nodes"
    }
  }

  # Allow access from VPC CIDR
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "PostgreSQL access from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name        = "${var.cluster_name}-postgres-sg"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Use AWS-managed RDS master user secret
data "aws_secretsmanager_secret" "postgres_password" {
  count = length(aws_db_instance.postgres.master_user_secret) > 0 ? 1 : 0
  arn   = aws_db_instance.postgres.master_user_secret[0].secret_arn
}

data "aws_secretsmanager_secret_version" "postgres_password" {
  count     = length(aws_db_instance.postgres.master_user_secret) > 0 ? 1 : 0
  secret_id = data.aws_secretsmanager_secret.postgres_password[0].id
}

# Parameter group to disable SSL for development
resource "aws_db_parameter_group" "postgres" {
  family = "postgres15"
  name   = "${var.cluster_name}-postgres-params"

  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }

  tags = {
    Name        = "${var.cluster_name}-postgres-params"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "postgres" {
  identifier = "${var.cluster_name}-postgres"

  # Engine configuration
  engine         = "postgres"
  engine_version = var.postgres_version
  instance_class = var.instance_class

  # Database configuration
  db_name  = var.db_name
  username = var.db_username
  manage_master_user_password = true
  master_user_secret_kms_key_id = null  # Uses default AWS managed key

  # Storage configuration
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  vpc_security_group_ids = [aws_security_group.postgres.id]
  publicly_accessible    = false
  parameter_group_name   = aws_db_parameter_group.postgres.name

  # High Availability (disabled for cost in test environment)
  multi_az = var.multi_az

  # Backup configuration
  backup_retention_period = var.backup_retention_period
  backup_window           = "03:00-04:00"         # UTC
  maintenance_window      = "sun:04:00-sun:05:00" # UTC

  # Security
  deletion_protection       = var.deletion_protection
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.cluster_name}-postgres-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  tags = {
    Name        = "${var.cluster_name}-postgres"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
