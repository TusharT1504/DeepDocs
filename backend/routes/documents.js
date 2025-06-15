const express = require('express');
const router = express.Router();
const multer = require('multer');
const Chat = require('../models/Chat');
const pdfService = require('../services/pdfService');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Upload document to a chat
router.post('/upload/:chatId', upload.single('document'), async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Check if chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Process PDF
    const documentInfo = await pdfService.processPDF(file);
    
    // Add document to chat
    chat.documents.push({
      filename: documentInfo.filename,
      originalName: documentInfo.originalName,
      path: documentInfo.path,
      vectorNamespace: documentInfo.vectorNamespace,
      uploadedAt: documentInfo.uploadedAt,
      pages: documentInfo.pages,
      title: documentInfo.title,
      author: documentInfo.author,
      size: documentInfo.size
    });
    
    await chat.save();
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: documentInfo
    });
    
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get document info by filename
router.get('/info/:filename', async (req, res) => {
  try {
    const info = await pdfService.getDocumentInfo(req.params.filename);
    res.json(info);
  } catch (error) {
    console.error('Error getting document info:', error);
    res.status(500).json({ error: 'Failed to get document info' });
  }
});

// Remove document from chat
router.delete('/remove/:chatId/:documentId', async (req, res) => {
  try {
    const { chatId, documentId } = req.params;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    const document = chat.documents.id(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    // Delete from storage and vector store
    await pdfService.deleteDocument(document.filename, document.vectorNamespace);
    
    // Remove from chat
    chat.documents.pull(documentId);
    await chat.save();
    
    res.json({ message: 'Document removed successfully' });
    
  } catch (error) {
    console.error('Error removing document:', error);
    res.status(500).json({ error: 'Failed to remove document' });
  }
});

// Get documents for a chat
router.get('/chat/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat.documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }
  next(error);
});

module.exports = router; 