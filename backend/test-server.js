const express = require('express');
const mongoose = require('mongoose');

// Simple test server to verify setup
const app = express();

app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Test MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Deepdocs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/test`);
}); 