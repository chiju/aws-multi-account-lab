// OpenTelemetry instrumentation - must be first
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'payment-service',
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
  res.end(register.metrics());
});

// Mock payments database
let payments = [];
let paymentIdCounter = 1;

app.get('/health', (req, res) => {
  res.json({ service: 'payment-service', status: 'healthy', port: 3004 });
});

// Process payment (called by order-service)
app.post('/payments/process', (req, res) => {
  const { userId, amount } = req.body;
  console.log(`💳 Payment Service: Processing payment for user ${userId}, amount $${amount}`);
  
  // Simulate payment processing
  const success = Math.random() > 0.1; // 90% success rate
  
  if (!success) {
    return res.status(400).json({ 
      success: false, 
      error: 'Payment declined',
      code: 'CARD_DECLINED' 
    });
  }
  
  const payment = {
    id: paymentIdCounter++,
    userId,
    amount,
    status: 'completed',
    transactionId: `txn_${Date.now()}`,
    processedAt: new Date().toISOString()
  };
  
  payments.push(payment);
  console.log(`✅ Payment Service: Payment ${payment.id} processed successfully`);
  
  res.json({ 
    success: true, 
    payment,
    message: 'Payment processed successfully' 
  });
});

// Get all payments
app.get('/payments', (req, res) => {
  res.json({ payments, count: payments.length });
});

app.listen(3004, () => console.log('💳 Payment Service running on port 3004'));
