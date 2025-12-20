// OpenTelemetry instrumentation - must be first
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'user-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

const express = require('express');
const cors = require('cors');
const promClient = require('prom-client');
const app = express();

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

app.use(cors());
app.use(express.json());

// Metrics middleware
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

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  register.metrics().then(metrics => res.end(metrics));
});

// Mock user database
const users = [
  { id: 1, email: 'john@example.com', name: 'John Doe', status: 'active' },
  { id: 2, email: 'jane@example.com', name: 'Jane Smith', status: 'active' },
  { id: 3, email: 'bob@example.com', name: 'Bob Wilson', status: 'inactive' }
];

app.get('/health', (req, res) => {
  res.json({ service: 'user-service', status: 'healthy', port: 3001 });
});

// Validate user (called by order-service)
app.post('/users/validate', (req, res) => {
  const { userId } = req.body;
  console.log(`🔍 User Service: Validating user ${userId}`);
  
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ valid: false, error: 'User not found' });
  if (user.status !== 'active') return res.status(403).json({ valid: false, error: 'User inactive' });
  
  console.log(`✅ User Service: User ${userId} is valid`);
  res.json({ valid: true, user });
});

app.listen(3001, () => console.log('👤 User Service running on port 3001'));
