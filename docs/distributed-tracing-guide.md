# Distributed Tracing with OpenTelemetry - Complete Guide

## Overview

This document demonstrates a complete distributed tracing implementation across 5 microservices using OpenTelemetry, with traces collected by an OpenTelemetry Collector and visualized in Grafana/Tempo.

## Architecture

```
Browser Request → Istio Gateway → Order Service → User/Inventory/Payment/Notification Services
                                      ↓
                              OpenTelemetry SDK (Auto-instrumentation)
                                      ↓
                              OpenTelemetry Collector
                                      ↓
                                 Tempo Backend
                                      ↓
                                Grafana Visualization
```

## Microservices Stack

| Service | Port | Endpoints | Purpose |
|---------|------|-----------|---------|
| **user-service** | 3001 | `/health`, `/users` | User validation |
| **order-service** | 3002 | `/health`, `/orders` | Order management |
| **inventory-service** | 3003 | `/health`, `/inventory` | Stock management |
| **payment-service** | 3004 | `/health`, `/payments` | Payment processing |
| **notification-service** | 3005 | `/health`, `/notifications` | Order notifications |

## OpenTelemetry Implementation

### Application-Level Instrumentation

Each microservice includes OpenTelemetry SDK configuration:

```javascript
// server.js - First lines (must be before other imports)
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'order-service', // Unique per service
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  instrumentations: [getNodeAutoInstrumentations()], // Auto-instruments HTTP, fs, etc.
});
sdk.start();
```

### Environment Configuration

Each pod is configured with OpenTelemetry environment variables:

```yaml
env:
  - name: OTEL_EXPORTER_OTLP_ENDPOINT
    value: "http://microservices-collector.opentelemetry.svc.cluster.local:4318"
  - name: OTEL_SERVICE_NAME
    value: "order-service"
  - name: OTEL_RESOURCE_ATTRIBUTES
    value: "service.name=order-service,service.version=1.0.0"
```

### OpenTelemetry Collector Configuration

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp:
    endpoint: http://tempo.tempo.svc.cluster.local:4317
    tls:
      insecure: true

processors:
  batch: {}
  memory_limiter:
    check_interval: 1s
    limit_percentage: 75

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp]
```

## Web Access Configuration

### Istio Virtual Service

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: order-service-vs
  namespace: order-service
spec:
  gateways:
  - istio-system/common-gateway
  hosts:
  - microservices.local
  http:
  - match:
    - uri:
        prefix: /orders
    route:
    - destination:
        host: order-service.order-service.svc.cluster.local
        port:
          number: 80
```

### DNS Configuration

Add to `/etc/hosts`:
```
18.198.33.74 microservices.local
```

## Generating Distributed Traces

### Method 1: Browser Console (Real User Interaction)

1. Navigate to `https://microservices.local/orders`
2. Open browser console (F12 → Console)
3. Execute JavaScript:

```javascript
// Create order (generates distributed trace)
fetch('/orders', {
  method: 'POST', 
  headers: {'Content-Type': 'application/json'}, 
  body: JSON.stringify({userId: 1, productId: 1, quantity: 2, amount: 99.99})
})
.then(response => response.json())
.then(data => console.log(data))

// Get orders list
fetch('/orders').then(r => r.json()).then(console.log)
```

### Method 2: Automated Script

```bash
# Use the provided script
./scripts/generate-traces.sh

# Or manual pod-to-pod calls
kubectl exec -n user-service $USER_POD -- wget -qO- http://order-service.order-service.svc.cluster.local/health
```

### Method 3: Real-time Pod Access

```bash
# Interactive shell
kubectl exec -it -n user-service user-service-pod -- /bin/sh

# Port forwarding
kubectl port-forward -n user-service svc/user-service 8080:80
curl http://localhost:8080/health
```

## Trace Analysis

### Grafana Access

- **URL**: `https://grafana.local`
- **Credentials**: `admin` / `prom-operator`
- **Datasource**: Tempo (UID: P214B5B846CF3925F)

### TraceQL Queries

```traceql
# All traces from order service
{.service.name="order-service"}

# HTTP POST operations only
{.http.method="POST"}

# Cross-service traces
{.service.name="user-service"} >> {.service.name="order-service"}

# Error traces
{.http.status_code>=400}

# Slow operations
{duration > 100ms}

# Health check endpoints
{.http.route="/health"}

# Business transactions
{.http.method="POST" && .service.name="order-service"}
```

### API Access

```bash
# Search traces via API
curl -k "https://grafana.local/api/datasources/proxy/uid/P214B5B846CF3925F/api/search?q=%7B.service.name%3D%22order-service%22%7D" -u "admin:prom-operator"

# Get specific trace
curl -k "https://grafana.local/api/datasources/proxy/uid/P214B5B846CF3925F/api/traces/TRACE_ID" -u "admin:prom-operator"
```

## Trace Types Generated

### Automatic Instrumentation Traces

| Trace Type | Source | Description |
|------------|--------|-------------|
| `GET /health` | HTTP auto-instrumentation | Health check endpoints |
| `POST /orders` | HTTP auto-instrumentation | Order creation requests |
| `fs realpathSync` | File system instrumentation | Node.js file operations |
| `fs readFileSync` | File system instrumentation | Configuration loading |

### Business Logic Traces

When creating an order via browser, the following distributed trace is generated:

1. **Order Service** receives `POST /orders`
2. **User Service** validates user via `/users/validate`
3. **Inventory Service** checks stock via `/inventory/check`
4. **Payment Service** processes payment via `/payments/process`
5. **Notification Service** sends confirmation via `/notifications/send`

## Verified Results

### Successful Browser Traces

From browser console testing:

```json
{
  "orders": [
    {"id": 1, "userId": 1, "productId": 2, "quantity": 1, "status": "confirmed"},
    {"id": 2, "userId": 1, "productId": 1, "quantity": 1, "status": "confirmed"}, 
    {"id": 3, "userId": 2, "productId": 1, "quantity": 1, "status": "confirmed"}
  ],
  "count": 3
}
```

### Trace Performance Data

| Trace ID | Operation | Duration | Services Involved |
|----------|-----------|----------|-------------------|
| `13a88450d67a3f23` | POST /orders | 94ms | 5 services |
| `17856c7c785fd788` | POST /orders | 64ms | 5 services |
| `c8b00b0fa27e2f83` | POST /orders | 229ms | 5 services |

## Key Benefits Demonstrated

1. **End-to-End Observability**: Complete request flow across all microservices
2. **Performance Monitoring**: Response times and bottleneck identification
3. **Error Tracking**: Failed requests with detailed error context
4. **Service Dependencies**: Visual representation of service interactions
5. **Real-time Monitoring**: Live trace generation from user interactions

## Troubleshooting

### Common Issues

1. **No traces visible**: Check OpenTelemetry SDK configuration and collector connectivity
2. **404 errors**: Verify Istio virtual service path mappings
3. **SSL issues**: Use HTTP instead of HTTPS for testing
4. **DNS resolution**: Ensure `.local` domains are in `/etc/hosts`

### Validation Commands

```bash
# Check collector is receiving traces
kubectl logs -n opentelemetry microservices-collector-pod

# Verify service endpoints
kubectl get svc -A | grep -E "(user|order|inventory|payment|notification)"

# Test internal connectivity
kubectl exec -n order-service order-pod -- wget -qO- http://user-service.user-service.svc.cluster.local/health
```

## Scripts and Tools

- **`scripts/generate-traces.sh`**: Automated trace generation
- **`scripts/realtime-access.sh`**: Real-time microservice access methods
- **`scripts/traceql-queries.md`**: TraceQL query reference

## Conclusion

This implementation demonstrates a complete distributed tracing solution with:
- ✅ 5 microservices with OpenTelemetry auto-instrumentation
- ✅ OpenTelemetry Collector for trace aggregation
- ✅ Tempo backend for trace storage
- ✅ Grafana for trace visualization and analysis
- ✅ Real browser-generated business transaction traces
- ✅ Complete observability across the entire microservices architecture

The system successfully captures and visualizes distributed traces from real user interactions, providing comprehensive observability for debugging, performance monitoring, and system understanding.
