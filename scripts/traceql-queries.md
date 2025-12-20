# TraceQL Queries for Microservices Observability

## Basic Service Queries

### 1. Filter by Service Name
```traceql
{.service.name="order-service"}
```

### 2. Filter by HTTP Method
```traceql
{.http.method="GET"}
```

### 3. Filter by HTTP Status Code
```traceql
{.http.status_code=200}
```

### 4. Filter by Span Kind
```traceql
{.span.kind="server"}
```

## Advanced Queries

### 5. Service-to-Service Communication
```traceql
{.service.name="user-service"} && {.service.name="order-service"}
```

### 6. Error Traces Only
```traceql
{.http.status_code>=400}
```

### 7. Slow Operations (Duration > 100ms)
```traceql
{duration>100ms}
```

### 8. Specific Endpoints
```traceql
{.http.route="/orders"} || {.http.route="/users"}
```

## Business Logic Queries

### 9. Order Processing Flow
```traceql
{.service.name="order-service"} | {.service.name="inventory-service"} | {.service.name="payment-service"}
```

### 10. Health Check Traces
```traceql
{.http.route="/health"}
```

### 11. POST Operations (Order Creation)
```traceql
{.http.method="POST" && .service.name="order-service"}
```

### 12. Cross-Service Traces (Multiple Services)
```traceql
{.service.name="user-service"} >> {.service.name="order-service"} >> {.service.name="payment-service"}
```

## Time-Based Queries

### 13. Recent Traces (Last 5 minutes)
```traceql
{.service.name="order-service"} | select(timestamp > now() - 5m)
```

### 14. Traces with Specific Attributes
```traceql
{.user.id="123"}
```

### 15. Database Operations
```traceql
{.db.operation="SELECT"} || {.db.operation="INSERT"}
```

## Performance Analysis

### 16. High Latency Traces
```traceql
{duration > 1s}
```

### 17. Traces with Errors
```traceql
{.otel.status_code="ERROR"}
```

### 18. Specific User Journey
```traceql
{.user.id="123" && .service.name="user-service"} >> {.service.name="order-service"}
```

## Usage Examples

### Via Grafana UI:
1. Go to https://grafana.local/explore
2. Select "Tempo" datasource
3. Paste any TraceQL query above
4. Click "Run Query"

### Via API:
```bash
# URL encode the TraceQL query
curl -k "https://grafana.local/api/datasources/proxy/uid/P214B5B846CF3925F/api/search?q=%7B.service.name%3D%22order-service%22%7D" -u "admin:prom-operator"
```

### Common URL Encodings:
- `{` = `%7B`
- `}` = `%7D`
- `"` = `%22`
- `=` = `%3D`
- `>` = `%3E`
- `&` = `%26`
