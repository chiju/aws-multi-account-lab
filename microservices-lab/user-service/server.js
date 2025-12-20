const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

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
