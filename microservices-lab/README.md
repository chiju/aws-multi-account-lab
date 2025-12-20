# 5-Microservices Architecture Lab

## Overview
This lab demonstrates **real microservices communication** with 5 interconnected services, each with its own Docker container, CI/CD pipeline, and Kubernetes deployment.

## Architecture

```
Frontend/API → Order Service (3002) → User Service (3001)      [Validate user]
                                   → Inventory Service (3003)   [Check stock]  
                                   → Payment Service (3004)     [Process payment]
                                   → Notification Service (3005) [Send confirmation]
```

## Services

### 1. User Service (Port 3001)
- **Purpose**: User authentication and validation
- **Database**: Users table (PostgreSQL)
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /users/validate` - Validate user (called by order-service)

### 2. Order Service (Port 3002) - **Orchestrator**
- **Purpose**: Order creation and workflow orchestration
- **Database**: Orders table (PostgreSQL)
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /orders` - Create order (calls 4 other services)
  - `GET /orders` - List all orders
- **Dependencies**: Calls User, Inventory, Payment, Notification services

### 3. Inventory Service (Port 3003)
- **Purpose**: Product inventory management
- **Database**: Inventory table (PostgreSQL)
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /inventory/check` - Check stock availability
  - `GET /inventory` - List all products

### 4. Payment Service (Port 3004)
- **Purpose**: Payment processing
- **Database**: Payments table (PostgreSQL)
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /payments/process` - Process payment
  - `GET /payments` - List all payments

### 5. Notification Service (Port 3005)
- **Purpose**: Send notifications (email, SMS)
- **Database**: Notifications table (Redis/PostgreSQL)
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /notifications/send` - Send notification
  - `GET /notifications` - List all notifications

## Communication Flow

### Order Creation Flow:
1. **Client** → `POST /orders` → **Order Service**
2. **Order Service** → `POST /users/validate` → **User Service**
3. **Order Service** → `POST /inventory/check` → **Inventory Service**
4. **Order Service** → `POST /payments/process` → **Payment Service**
5. **Order Service** → `POST /notifications/send` → **Notification Service**
6. **Order Service** → Returns order confirmation to **Client**

## Deployment Strategy

### Repository Structure (Learning Phase)
```
microservices-lab/
├── user-service/
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── order-service/
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── inventory-service/
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
├── payment-service/
│   ├── server.js
│   ├── Dockerfile
│   └── package.json
└── notification-service/
    ├── server.js
    ├── Dockerfile
    └── package.json
```

### Kubernetes Deployment Structure
```
apps/
├── user-service/           # Helm chart
├── order-service/          # Helm chart
├── inventory-service/      # Helm chart
├── payment-service/        # Helm chart
└── notification-service/   # Helm chart

argocd-apps/
├── user-service.yaml      # ArgoCD application
├── order-service.yaml     # ArgoCD application
├── inventory-service.yaml # ArgoCD application
├── payment-service.yaml   # ArgoCD application
└── notification-service.yaml # ArgoCD application
```

### CI/CD Pipeline Structure
```
.github/workflows/
├── user-service-cicd.yml
├── order-service-cicd.yml
├── inventory-service-cicd.yml
├── payment-service-cicd.yml
└── notification-service-cicd.yml
```

## Database Strategy

Each service owns its data:
- **user-service**: `users` table
- **order-service**: `orders` table
- **inventory-service**: `inventory` table
- **payment-service**: `payments` table
- **notification-service**: `notifications` table (Redis for queuing)

## Scaling Strategy

Each service can scale independently:
- **User Service**: Scale based on authentication requests
- **Order Service**: Scale based on order volume
- **Inventory Service**: Scale based on product catalog size
- **Payment Service**: Scale based on transaction volume
- **Notification Service**: Scale based on message queue depth

## Testing

### Local Testing
```bash
# Start all services
npm run start:all

# Test complete order flow
curl http://localhost:3002/orders -X POST \
  -H 'Content-Type: application/json' \
  -d '{"userId":1,"productId":1,"quantity":2,"amount":1998}'

# Check individual services
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health
```

### Kubernetes Testing
```bash
# Check all services
kubectl get pods -n microservices
kubectl get svc -n microservices

# Test via Istio Gateway
curl https://microservices.local/orders -X POST \
  -H 'Content-Type: application/json' \
  -d '{"userId":1,"productId":1,"quantity":2,"amount":1998}'
```

## Monitoring & Observability

### Metrics (Prometheus)
- Request rate per service
- Response time per service
- Error rate per service
- Inter-service call latency

### Tracing (Tempo/Jaeger)
- End-to-end order flow tracing
- Service dependency mapping
- Performance bottleneck identification

### Logging (Grafana Loki)
- Centralized logging from all services
- Correlation IDs for request tracking
- Error aggregation and alerting

## Industry Best Practices Demonstrated

✅ **Service Independence**: Each service can be developed, deployed, and scaled independently  
✅ **Database per Service**: No shared databases between services  
✅ **API-First Design**: Services communicate via well-defined APIs  
✅ **Fault Tolerance**: Services handle failures from dependent services  
✅ **Observability**: Comprehensive monitoring, logging, and tracing  
✅ **Container-First**: Each service runs in its own container  
✅ **GitOps Deployment**: Infrastructure and applications managed via Git  
✅ **Auto-Scaling**: Services scale based on demand metrics  

## Next Steps

1. **Create Dockerfiles** for each service
2. **Create Helm Charts** for Kubernetes deployment
3. **Create CI/CD Pipelines** for automated build/deploy
4. **Create ArgoCD Applications** for GitOps deployment
5. **Add Monitoring** with Prometheus metrics
6. **Add Tracing** with OpenTelemetry
7. **Add Database** connections (PostgreSQL/Redis)
8. **Add Authentication** with JWT tokens
9. **Add Rate Limiting** and circuit breakers
10. **Split into Separate Repositories** (production approach)
