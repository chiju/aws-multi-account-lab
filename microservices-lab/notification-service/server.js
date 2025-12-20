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
    status: 'sent',
    sentAt: new Date().toISOString()
  };
  
  notifications.push(notification);
  
  // Simulate sending email/SMS
  console.log(`✅ Notification Service: ${type} sent to user ${userId}: "${message}"`);
  
  res.json({ 
    success: true, 
    notification,
    message: 'Notification sent successfully' 
  });
});

// Get all notifications
app.get('/notifications', (req, res) => {
  res.json({ notifications, count: notifications.length });
});

app.listen(3005, () => console.log('📧 Notification Service running on port 3005'));
