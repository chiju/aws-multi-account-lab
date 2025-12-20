// OpenTelemetry instrumentation - must be first
const { NodeSDK } = require('@opentelemetry/auto-instrumentations-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'order-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock orders database
let orders = [];
let orderIdCounter = 1;

app.get('/health', (req, res) => {
  res.json({ service: 'order-service', status: 'healthy', port: 3002   instrumentations: [getNodeAutoInstrumentations()],
});
  instrumentations: [getNodeAutoInstrumentations()],
});

// Create order (calls 3 other services)
app.post('/orders', async (req, res) => {
  const { userId, productId, quantity, amount } = req.body;
  console.log(`📦 Order Service: Creating order for user ${userId}`);

  try {
    // 1. Validate user
    console.log('→ Calling User Service...');
    const userResponse = await axios.post('http://user-service.user-service.svc.cluster.local/users/validate', { userId   instrumentations: [getNodeAutoInstrumentations()],
});
    
    // 2. Check inventory
    console.log('→ Calling Inventory Service...');
    const inventoryResponse = await axios.post('http://inventory-service.inventory-service.svc.cluster.local/inventory/check', { 
      productId, quantity 
      instrumentations: [getNodeAutoInstrumentations()],
});
    
    // 3. Process payment
    console.log('→ Calling Payment Service...');
    const paymentResponse = await axios.post('http://payment-service.payment-service.svc.cluster.local/payments/process', { 
      userId, amount 
      instrumentations: [getNodeAutoInstrumentations()],
});
    
    // 4. Create order
    const order = {
      id: orderIdCounter++,
      userId,
      productId,
      quantity,
      amount,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    orders.push(order);
    
    // 5. Send notification
    console.log('→ Calling Notification Service...');
    await axios.post('http://notification-service.notification-service.svc.cluster.local/notifications/send', {
      userId,
      message: `Order ${order.id} confirmed`,
      type: 'order_confirmation'
      instrumentations: [getNodeAutoInstrumentations()],
});
    
    console.log(`✅ Order Service: Order ${order.id} created successfully`);
    res.status(201).json({ success: true, order   instrumentations: [getNodeAutoInstrumentations()],
});
    
  } catch (error) {
    console.error('❌ Order Service: Order creation failed:', error.message);
    res.status(400).json({ 
      success: false, 
      error: 'Order creation failed',
      details: error.response?.data || error.message 
      instrumentations: [getNodeAutoInstrumentations()],
});
  }
  instrumentations: [getNodeAutoInstrumentations()],
});

// Get all orders
app.get('/orders', (req, res) => {
  res.json({ orders, count: orders.length   instrumentations: [getNodeAutoInstrumentations()],
});
  instrumentations: [getNodeAutoInstrumentations()],
});

app.listen(3002, () => console.log('📦 Order Service running on port 3002'));
