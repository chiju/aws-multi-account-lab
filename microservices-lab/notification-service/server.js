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
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

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
