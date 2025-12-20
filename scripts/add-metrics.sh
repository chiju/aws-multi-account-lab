#!/bin/bash

# Add Prometheus metrics to all microservices
echo "🔧 Adding Prometheus metrics to all microservices..."

for service in payment-service notification-service; do
  echo "Adding metrics to $service..."
  
  # Add prom-client import after existing requires
  sed -i '' '/const app = express();/i\
const promClient = require('\''prom-client'\'');
' microservices-lab/$service/server.js

  # Add metrics setup after app creation
  sed -i '' '/const app = express();/a\
\
// Prometheus metrics setup\
const register = new promClient.Registry();\
promClient.collectDefaultMetrics({ register });\
\
const httpRequestsTotal = new promClient.Counter({\
  name: '\''http_requests_total'\'',\
  help: '\''Total number of HTTP requests'\'',\
  labelNames: ['\''method'\'', '\''route'\'', '\''status_code'\''],\
  registers: [register]\
});
' microservices-lab/$service/server.js

  # Add metrics middleware and endpoint
  sed -i '' '/app.use(express.json());/a\
\
// Metrics middleware\
app.use((req, res, next) => {\
  res.on('\''finish'\'', () => {\
    httpRequestsTotal.inc({\
      method: req.method,\
      route: req.route?.path || req.path,\
      status_code: res.statusCode\
    });\
  });\
  next();\
});\
\
// Metrics endpoint\
app.get('\''/metrics'\'', (req, res) => {\
  res.set('\''Content-Type'\'', register.contentType);\
  res.end(register.metrics());\
});
' microservices-lab/$service/server.js

done

echo "✅ Metrics added to all services"
