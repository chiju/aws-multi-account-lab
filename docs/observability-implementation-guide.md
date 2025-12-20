# Complete Observability Stack Implementation Guide

## Overview

This document provides a comprehensive guide for implementing the three pillars of observability (Metrics, Tracing, and Logging) in microservices applications. It covers both manual application-level changes and automatic infrastructure-level components.

## The Three Pillars of Observability

### 1️⃣ METRICS (Prometheus) - Manual + Automatic

**Purpose**: Numerical data about system performance, resource usage, and business metrics.

#### Manual Implementation Required

**Dependencies:**
```json
{
  "prom-client": "^15.1.3"
}
```

**Application Code:**
```javascript
// Add to the top of your server.js (after other imports)
const promClient = require('prom-client');

// Create registry and collect default metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Middleware to track HTTP requests
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    });
  });
  next();
});

// CRITICAL: Metrics endpoint (async handling required)
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  register.metrics().then(metrics => res.end(metrics));
});
```

#### Automatic Infrastructure Components

**ServiceMonitor (Kubernetes):**
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-service-monitor
  namespace: my-service
spec:
  endpoints:
  - interval: 30s
    path: /metrics
    port: http
  selector:
    matchLabels:
      app: my-service
```

**What You Get:**
- **Default Node.js metrics**: CPU, memory, event loop lag, garbage collection
- **HTTP request metrics**: Request count, duration, status codes
- **Custom business metrics**: Order count, user registrations, etc.
- **Automatic scraping**: Prometheus collects data every 30 seconds

### 2️⃣ TRACING (OpenTelemetry) - Manual + Automatic

**Purpose**: Distributed request flows across microservices with timing and error information.

#### Manual Implementation Required

**Dependencies:**
```json
{
  "@opentelemetry/sdk-node": "^0.54.0",
  "@opentelemetry/auto-instrumentations-node": "^0.50.0",
  "@opentelemetry/resources": "^1.28.0",
  "@opentelemetry/semantic-conventions": "^1.28.0"
}
```

**Application Code:**
```javascript
// CRITICAL: Must be the FIRST imports in your application
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-service', // Unique per service
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  instrumentations: [getNodeAutoInstrumentations()], // Auto-instruments HTTP, fs, etc.
});

// Start tracing
sdk.start();

// Now import your other modules
const express = require('express');
// ... rest of your application
```

**Environment Variables:**
```yaml
env:
  - name: OTEL_EXPORTER_OTLP_ENDPOINT
    value: "http://otel-collector.opentelemetry.svc.cluster.local:4318"
  - name: OTEL_SERVICE_NAME
    value: "my-service"
  - name: OTEL_RESOURCE_ATTRIBUTES
    value: "service.name=my-service,service.version=1.0.0"
```

#### Automatic Infrastructure Components

**OpenTelemetry Collector:**
```yaml
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: otel-collector
spec:
  config: |
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

**What You Get:**
- **HTTP request traces**: Complete request/response cycles
- **Database query traces**: SQL queries with timing
- **File system traces**: File operations (fs.readFile, etc.)
- **Cross-service traces**: Distributed traces across microservices
- **Error tracking**: Exception traces with stack traces

### 3️⃣ LOGGING (Loki) - Completely Automatic ✨

**Purpose**: Structured and unstructured log data from all applications and infrastructure.

#### No Manual Implementation Required

**Application Code:**
```javascript
// ✅ NO CHANGES NEEDED - Just use standard logging
console.log('User created:', { userId: 123, email: 'user@example.com' });
console.error('Database connection failed:', error);

// Or use any logging library
const winston = require('winston');
logger.info('Order processed', { orderId: 456, amount: 99.99 });
```

#### Automatic Infrastructure Components

**Promtail DaemonSet:**
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: promtail
spec:
  selector:
    matchLabels:
      name: promtail
  template:
    spec:
      containers:
      - name: promtail
        image: grafana/promtail:latest
        volumeMounts:
        - name: varlog
          mountPath: /var/log
        - name: varlibdockercontainers
          mountPath: /var/lib/docker/containers
      volumes:
      - name: varlog
        hostPath:
          path: /var/log
      - name: varlibdockercontainers
        hostPath:
          path: /var/lib/docker/containers
```

**What You Get:**
- **All pod logs**: stdout/stderr from every container
- **Kubernetes metadata**: Pod name, namespace, labels
- **Log aggregation**: Centralized log storage in Loki
- **Log parsing**: Automatic JSON parsing and indexing
- **Zero configuration**: Works out of the box

## Implementation Checklist

### For Each Microservice

#### Metrics Implementation
- [ ] Install `prom-client` dependency
- [ ] Add Prometheus registry setup
- [ ] Create custom metrics (HTTP requests, business metrics)
- [ ] Add metrics middleware
- [ ] Implement `/metrics` endpoint with async handling
- [ ] Create ServiceMonitor resource
- [ ] Verify Prometheus is scraping data

#### Tracing Implementation  
- [ ] Install OpenTelemetry dependencies
- [ ] Add OpenTelemetry SDK initialization (FIRST in file)
- [ ] Configure service name and version
- [ ] Set environment variables for OTLP endpoint
- [ ] Deploy OpenTelemetry Collector
- [ ] Configure Tempo backend
- [ ] Verify traces in Grafana

#### Logging Implementation
- [ ] ✅ **Nothing required** - automatic via Promtail DaemonSet
- [ ] Verify Loki is deployed
- [ ] Verify Promtail is running on all nodes
- [ ] Check logs in Grafana

### Infrastructure Requirements

#### Prometheus Stack
```bash
# Install kube-prometheus-stack
helm install monitoring prometheus-community/kube-prometheus-stack
```

#### OpenTelemetry Stack
```bash
# Install OpenTelemetry Operator
kubectl apply -f https://github.com/open-telemetry/opentelemetry-operator/releases/latest/download/opentelemetry-operator.yaml

# Install Tempo
helm install tempo grafana/tempo
```

#### Loki Stack
```bash
# Install Loki
helm install loki grafana/loki-stack
```

## Common Issues and Solutions

### Metrics Issues

**Problem**: `/metrics` endpoint returns 500 error
```javascript
// ❌ Wrong (synchronous)
res.end(register.metrics());

// ✅ Correct (asynchronous)
register.metrics().then(metrics => res.end(metrics));
```

**Problem**: ServiceMonitor not collecting data
- Verify `/metrics` endpoint is accessible
- Check ServiceMonitor selector matches service labels
- Ensure Prometheus has RBAC permissions

### Tracing Issues

**Problem**: No traces generated
- Ensure OpenTelemetry SDK is initialized FIRST
- Check OTLP endpoint environment variable
- Verify OpenTelemetry Collector is running

**Problem**: Incomplete traces
- Check all services have OpenTelemetry SDK
- Verify trace context propagation between services
- Ensure auto-instrumentations are enabled

### Logging Issues

**Problem**: No logs in Loki
- Verify Promtail DaemonSet is running on all nodes
- Check Promtail has access to `/var/log` and `/var/lib/docker/containers`
- Ensure Loki service is accessible

## Verification Commands

### Check Metrics
```bash
# Test metrics endpoint
curl http://my-service:3000/metrics

# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Visit http://localhost:9090/targets
```

### Check Tracing
```bash
# Check OpenTelemetry Collector logs
kubectl logs -n opentelemetry deployment/otel-collector

# View traces in Grafana
kubectl port-forward -n monitoring svc/grafana 3000:80
# Visit http://localhost:3000/explore → Select Tempo
```

### Check Logging
```bash
# Check Promtail logs
kubectl logs -n loki daemonset/promtail

# View logs in Grafana
kubectl port-forward -n monitoring svc/grafana 3000:80
# Visit http://localhost:3000/explore → Select Loki
```

## TraceQL Query Examples

```traceql
# All traces from a service
{.service.name="order-service"}

# HTTP POST operations
{.http.method="POST"}

# Cross-service traces
{.service.name="user-service"} >> {.service.name="order-service"}

# Error traces
{.http.status_code>=400}

# Slow operations
{duration > 100ms}
```

## PromQL Query Examples

```promql
# HTTP request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage
process_resident_memory_bytes
```

## LogQL Query Examples

```logql
# All logs from a service
{app="order-service"}

# Error logs only
{app="order-service"} |= "ERROR"

# JSON log parsing
{app="order-service"} | json | level="error"

# Rate of errors
rate({app="order-service"} |= "ERROR" [5m])
```

## Best Practices

### Metrics
- Use consistent naming conventions (snake_case)
- Add meaningful labels but avoid high cardinality
- Implement both technical and business metrics
- Set appropriate scrape intervals (15-60 seconds)

### Tracing
- Initialize OpenTelemetry SDK before other imports
- Use semantic conventions for span attributes
- Implement custom spans for business logic
- Propagate trace context between services

### Logging
- Use structured logging (JSON format)
- Include correlation IDs for request tracking
- Log at appropriate levels (DEBUG, INFO, WARN, ERROR)
- Avoid logging sensitive information

## Performance Considerations

### Metrics
- Default metrics collection has minimal overhead (~1-2% CPU)
- Custom metrics should be used judiciously
- Consider sampling for high-frequency metrics

### Tracing
- Auto-instrumentation adds ~5-10% overhead
- Use sampling for high-traffic applications
- Batch trace exports for efficiency

### Logging
- Promtail uses minimal resources (~50MB RAM per node)
- Log retention policies prevent storage bloat
- Structured logs are more efficient than plain text

## Security Considerations

- Secure metrics endpoints with authentication
- Use TLS for trace and log transmission
- Implement log sanitization for sensitive data
- Regular security updates for observability components

## Conclusion

This observability stack provides complete visibility into your microservices:

- **Metrics**: Performance and business KPIs via Prometheus
- **Tracing**: Request flows and dependencies via OpenTelemetry/Tempo  
- **Logging**: Detailed application and system logs via Loki

The combination enables effective monitoring, debugging, and optimization of distributed systems while maintaining production performance and security standards.
