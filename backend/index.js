const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv=require("dotenv");
dotenv.config();

const app = express();

// Middleware
app.use(
    cors({

        origin:[
            "https://deep-docs-five.vercel.app",
            "https://deep-docs-tushars-projects-4bd6811b.vercel.app",
            "https://deep-docs-git-main-tushars-projects-4bd6811b.vercel.app",
            "http://localhost:5000"
    ],
        credentials:true,
    })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Deepdocs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const ragRoute = require("./routes/rag");
const chatRoute = require("./routes/chats");
const documentRoute = require("./routes/documents");

app.use("/api/rag", ragRoute);
app.use("/api/chats", chatRoute);
app.use("/api/documents", documentRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
