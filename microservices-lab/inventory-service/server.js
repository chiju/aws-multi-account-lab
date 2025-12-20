// OpenTelemetry instrumentation - must be first
const { NodeSDK } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: '$service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
});
sdk.start();

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock inventory database
const inventory = [
  { productId: 1, name: 'Laptop', stock: 10, price: 999 },
  { productId: 2, name: 'Phone', stock: 5, price: 599 },
  { productId: 3, name: 'Tablet', stock: 0, price: 399 }
];

app.get('/health', (req, res) => {
  res.json({ service: 'inventory-service', status: 'healthy', port: 3003 });
});

// Check inventory (called by order-service)
app.post('/inventory/check', (req, res) => {
  const { productId, quantity } = req.body;
  console.log(`📦 Inventory Service: Checking stock for product ${productId}, quantity ${quantity}`);
  
  const product = inventory.find(p => p.productId === productId);
  if (!product) {
    return res.status(404).json({ available: false, error: 'Product not found' });
  }
  
  if (product.stock < quantity) {
    return res.status(400).json({ 
      available: false, 
      error: 'Insufficient stock',
      available_stock: product.stock 
    });
  }
  
  // Reserve stock
  product.stock -= quantity;
  console.log(`✅ Inventory Service: Reserved ${quantity} units of ${product.name}`);
  
  res.json({ 
    available: true, 
    product: product.name,
    reserved_quantity: quantity,
    remaining_stock: product.stock 
  });
});

// Get all inventory
app.get('/inventory', (req, res) => {
  res.json({ inventory, count: inventory.length });
});

app.listen(3003, () => console.log('📦 Inventory Service running on port 3003'));
