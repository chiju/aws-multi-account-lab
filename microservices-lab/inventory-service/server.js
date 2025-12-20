// OpenTelemetry instrumentation - must be first
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'inventory-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

const promClient = require('prom-client');
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

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

app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  register.metrics().then(metrics => res.end(metrics));
});

// Mock inventory database
const inventory = [
  { productId: 1, name: 'Laptop', stock: 500, price: 999 },
  { productId: 2, name: 'Phone', stock: 500, price: 599 },
  { productId: 3, name: 'Tablet', stock: 500, price: 399 },
  { productId: 4, name: 'Monitor', stock: 500, price: 299 },
  { productId: 5, name: 'Keyboard', stock: 500, price: 99 },
  { productId: 6, name: 'Mouse', stock: 500, price: 49 },
  { productId: 7, name: 'Headphones', stock: 500, price: 199 },
  { productId: 8, name: 'Webcam', stock: 500, price: 129 },
  { productId: 9, name: 'Speaker', stock: 500, price: 79 },
  { productId: 10, name: 'Microphone', stock: 500, price: 89 },
  { productId: 11, name: 'Router', stock: 500, price: 149 },
  { productId: 12, name: 'Switch', stock: 500, price: 199 },
  { productId: 13, name: 'Cable', stock: 500, price: 19 },
  { productId: 14, name: 'Adapter', stock: 500, price: 29 },
  { productId: 15, name: 'Charger', stock: 500, price: 39 },
  { productId: 16, name: 'Battery', stock: 500, price: 59 },
  { productId: 17, name: 'Case', stock: 500, price: 25 },
  { productId: 18, name: 'Stand', stock: 500, price: 35 },
  { productId: 19, name: 'Dock', stock: 500, price: 89 },
  { productId: 20, name: 'Hub', stock: 500, price: 69 },
  { productId: 21, name: 'Drive', stock: 500, price: 119 },
  { productId: 22, name: 'Memory', stock: 500, price: 79 },
  { productId: 23, name: 'Processor', stock: 500, price: 299 },
  { productId: 24, name: 'Graphics Card', stock: 500, price: 599 },
  { productId: 25, name: 'Motherboard', stock: 500, price: 199 },
  { productId: 26, name: 'Power Supply', stock: 500, price: 99 },
  { productId: 27, name: 'Cooling Fan', stock: 500, price: 49 },
  { productId: 28, name: 'Thermal Paste', stock: 500, price: 15 },
  { productId: 29, name: 'Screwdriver', stock: 500, price: 25 },
  { productId: 30, name: 'Toolkit', stock: 500, price: 45 },
  { productId: 31, name: 'Printer', stock: 500, price: 199 },
  { productId: 32, name: 'Scanner', stock: 500, price: 149 },
  { productId: 33, name: 'Projector', stock: 500, price: 399 },
  { productId: 34, name: 'Screen', stock: 500, price: 299 },
  { productId: 35, name: 'TV', stock: 500, price: 599 },
  { productId: 36, name: 'Soundbar', stock: 500, price: 199 },
  { productId: 37, name: 'Remote', stock: 500, price: 29 },
  { productId: 38, name: 'Game Console', stock: 500, price: 499 },
  { productId: 39, name: 'Controller', stock: 500, price: 69 },
  { productId: 40, name: 'VR Headset', stock: 500, price: 399 },
  { productId: 41, name: 'Smart Watch', stock: 500, price: 299 },
  { productId: 42, name: 'Fitness Tracker', stock: 500, price: 149 },
  { productId: 43, name: 'Earbuds', stock: 500, price: 99 },
  { productId: 44, name: 'Power Bank', stock: 500, price: 49 },
  { productId: 45, name: 'Wireless Charger', stock: 500, price: 39 },
  { productId: 46, name: 'Car Mount', stock: 500, price: 25 },
  { productId: 47, name: 'Tripod', stock: 500, price: 59 },
  { productId: 48, name: 'Gimbal', stock: 500, price: 199 },
  { productId: 49, name: 'Drone', stock: 500, price: 799 },
  { productId: 50, name: 'Action Camera', stock: 500, price: 299 }
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
    return res.status(404).json({ available: false, error: 'Product not found'
});
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
  res.json({ inventory, count: inventory.length
});

});

app.listen(3003, () => console.log('📦 Inventory Service running on port 3003'));
