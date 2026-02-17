# AWS Deployment Guide

Complete production deployment using AWS services.

## Architecture Overview
```
┌─────────────────────────────────────────────────┐
│                CloudFront (CDN)                  │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌────────▼──────────┐
│   S3 Bucket    │    │  Application      │
│   (Frontend)   │    │  Load Balancer    │
└────────────────┘    └────────┬──────────┘
                                │
                    ┌───────────┴──────────┐
                    │                      │
            ┌───────▼─────────┐   ┌───────▼─────────┐
            │  ECS Service    │   │  ECS Service    │
            │  (Backend API)  │   │  (Celery)       │
            └───────┬─────────┘   └─────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌────────▼──────────┐
│   RDS          │    │  ElastiCache      │
│  (PostgreSQL)  │    │  (Redis)          │
└────────────────┘    └───────────────────┘
```

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- Docker installed
- Terraform (optional, for IaC)

## Step 1: Install AWS CLI
```bash
# macOS
brew install awscli

# Windows
# Download from https://aws.amazon.com/cli/

# Ubuntu
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

## Step 2: Configure AWS CLI
```bash
aws configure

# Enter:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: us-east-1
# Default output format: json
```

## Step 3: Create RDS Database
```bash
# Create database
aws rds create-db-instance \
    --db-instance-identifier supply-chain-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.3 \
    --master-username admin \
    --master-user-password YourStrongPassword123! \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxx \
    --db-subnet-group-name your-subnet-group \
    --backup-retention-period 7 \
    --publicly-accessible false

# Wait for creation
aws rds wait db-instance-available \
    --db-instance-identifier supply-chain-db

# Get endpoint
aws rds describe-db-instances \
    --db-instance-identifier supply-chain-db \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text
```

## Step 4: Create ElastiCache (Redis)
```bash
aws elasticache create-cache-cluster \
    --cache-cluster-id supply-chain-redis \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1 \
    --security-group-ids sg-xxxxxxxx
```

## Step 5: Create ECR Repositories
```bash
# Create backend repository
aws ecr create-repository --repository-name supply-chain-backend

# Create frontend repository
aws ecr create-repository --repository-name supply-chain-frontend

# Get login command
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin \
    123456789012.dkr.ecr.us-east-1.amazonaws.com
```

## Step 6: Build and Push Docker Images
```bash
# Backend
cd backend
docker build -t supply-chain-backend .
docker tag supply-chain-backend:latest \
    123456789012.dkr.ecr.us-east-1.amazonaws.com/supply-chain-backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/supply-chain-backend:latest

# Frontend
cd ../frontend
docker build -t supply-chain-frontend .
docker tag supply-chain-frontend:latest \
    123456789012.dkr.ecr.us-east-1.amazonaws.com/supply-chain-frontend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/supply-chain-frontend:latest
```

## Step 7: Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name supply-chain-cluster
```

## Step 8: Create Task Definitions

**Backend Task Definition** (`backend-task-definition.json`):
```json
{
  "family": "supply-chain-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/supply-chain-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://admin:password@rds-endpoint:5432/supplychain"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://elasticache-endpoint:6379/0"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/supply-chain-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task:
```bash
aws ecs register-task-definition \
    --cli-input-json file://backend-task-definition.json
```

## Step 9: Create ECS Services
```bash
aws ecs create-service \
    --cluster supply-chain-cluster \
    --service-name backend-service \
    --task-definition supply-chain-backend \
    --desired-count 2 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=8000"
```

## Step 10: Create S3 Bucket for Frontend
```bash
# Create bucket
aws s3 mb s3://supply-chain-frontend

# Enable static website hosting
aws s3 website s3://supply-chain-frontend \
    --index-document index.html \
    --error-document index.html

# Upload frontend build
cd frontend
npm run build
aws s3 sync dist/ s3://supply-chain-frontend --delete

# Set bucket policy (public read)
aws s3api put-bucket-policy \
    --bucket supply-chain-frontend \
    --policy file://bucket-policy.json
```

**bucket-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::supply-chain-frontend/*"
    }
  ]
}
```

## Step 11: Create CloudFront Distribution
aws cloudfront create-distribution \
    --origin-domain-name supply-chain-frontend.s3.amazonaws.com \
    --default-root-object index.html