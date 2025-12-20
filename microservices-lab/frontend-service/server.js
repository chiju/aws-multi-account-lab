// OpenTelemetry instrumentation - must be first
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'frontend-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

const express = require('express');
const axios = require('axios');
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
app.use(express.static('public'));

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

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'frontend-service', status: 'healthy', port: 3006 });
});

// Serve main dashboard
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// API proxy endpoints to other microservices
const services = {
  'user-service': 'http://user-service.user-service.svc.cluster.local',
  'order-service': 'http://order-service.order-service.svc.cluster.local', 
  'inventory-service': 'http://inventory-service.inventory-service.svc.cluster.local',
  'payment-service': 'http://payment-service.payment-service.svc.cluster.local',
  'notification-service': 'http://notification-service.notification-service.svc.cluster.local'
};

// Health check all services
app.get('/api/services/health', async (req, res) => {
  console.log('🔍 Frontend Service: Checking health of all microservices');
  
  const healthChecks = await Promise.allSettled(
    Object.entries(services).map(async ([name, url]) => {
      try {
        const response = await axios.get(`${url}/health`, { timeout: 5000 });
        return { service: name, status: 'healthy', data: response.data };
      } catch (error) {
        return { service: name, status: 'error', error: error.message };
      }
    })
  );

  const results = healthChecks.map(result => result.value);
  res.json({ services: results, timestamp: new Date().toISOString() });
});

// Get metrics from all services
app.get('/api/services/metrics', async (req, res) => {
  console.log('📊 Frontend Service: Fetching metrics from all microservices');
  
  const metricsChecks = await Promise.allSettled(
    Object.entries(services).map(async ([name, url]) => {
      try {
        const response = await axios.get(`${url}/metrics`, { timeout: 5000 });
        // Parse basic metrics
        const metrics = response.data;
        const httpRequests = metrics.match(/http_requests_total\{[^}]+\}\s+(\d+)/g) || [];
        const totalRequests = httpRequests.reduce((sum, match) => {
          const value = parseInt(match.split(' ').pop());
          return sum + value;
        }, 0);
        
        return { 
          service: name, 
          status: 'success', 
          totalRequests,
          metricsSize: metrics.length 
        };
      } catch (error) {
        return { service: name, status: 'error', error: error.message };
      }
    })
  );

  const results = metricsChecks.map(result => result.value);
  res.json({ services: results, timestamp: new Date().toISOString() });
});

// Proxy order creation (distributed transaction)
app.post('/api/orders', async (req, res) => {
  const { userId, productId, quantity, amount } = req.body;
  console.log(`📦 Frontend Service: Creating order for user ${userId}`);
  
  try {
    const response = await axios.post(`${services['order-service']}/orders`, {
      userId, productId, quantity, amount
    }, { timeout: 10000 });
    
    console.log('✅ Frontend Service: Order created successfully');
    res.json(response.data);
  } catch (error) {
    console.error('❌ Frontend Service: Order creation failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Order creation failed', 
      details: error.message 
    });
  }
});

// Get orders
app.get('/api/orders', async (req, res) => {
  try {
    const response = await axios.get(`${services['order-service']}/orders`, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`🌐 Frontend Service running on port ${PORT}`);
});
