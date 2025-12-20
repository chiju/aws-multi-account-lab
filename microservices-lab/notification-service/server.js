// OpenTelemetry instrumentation - must be first
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'notification-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),

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

// Mock notifications database
let notifications = [];
let notificationIdCounter = 1;

app.get('/health', (req, res) => {
  res.json({ service: 'notification-service', status: 'healthy', port: 3005 });
});

// Send notification (called by order-service)
app.post('/notifications/send', (req, res) => {
  const { userId, message, type } = req.body;
  console.log(`📧 Notification Service: Sending ${type} to user ${userId}`);
  
  const notification = {
    id: notificationIdCounter++,
    userId,
    message,
    type,
    timestamp: new Date().toISOString(),
    status: 'sent'
  };
  
  notifications.push(notification);
  
  res.json({ 
    success: true, 
    notification,
    message: 'Notification sent successfully' 
  });
});

// Get all notifications
app.get('/notifications', (req, res) => {
  res.json({
    success: true,
    data: notifications,
    count: notifications.length
  });
});

// Get notifications for a specific user
app.get('/notifications/user/:userId', (req, res) => {
  const { userId } = req.params;
  const userNotifications = notifications.filter(n => n.userId === parseInt(userId));
  
  res.json({
    success: true,
    data: userNotifications,
    count: userNotifications.length
  });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`📧 Notification Service running on port ${PORT}`);
});
