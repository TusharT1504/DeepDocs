const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const enhancedRagService = require('../services/enhancedRagService');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Chat API is working',
    timestamp: new Date().toISOString(),
    env: {
      hasGoogleKey: !!process.env.GOOGLE_API_KEY,
      hasPineconeKey: !!process.env.PINECONE_API_KEY
    }
  });
});

// Get all chats
router.get('/', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Create new chat
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const chat = new Chat({
      title: title || 'New Chat'
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Get chat by ID with messages
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    const messages = await Message.find({ chatId: req.params.id }).sort({ timestamp: 1 });
    res.json({ chat, messages });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Update chat title
router.put('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await Chat.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
});

// Delete chat
router.delete('/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Delete all messages
    await Message.deleteMany({ chatId: req.params.id });
    
    // Clear memory
    await enhancedRagService.clearMemory(req.params.id);
    
    // Delete chat
    await Chat.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// Send message to chat
router.post('/:id/messages', async (req, res) => {
  try {
    const { content } = req.body;
    const chatId = req.params.id;
    
    console.log('Received message request:', { chatId, content });
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.log('Chat not found:', chatId);
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    console.log('Chat found:', chat.title);
    
    // Save user message
    const userMessage = new Message({
      chatId,
      role: 'user',
      content
    });
    await userMessage.save();
    console.log('User message saved');
    
    // Get document namespaces for this chat
    const documentNamespaces = chat.documents.map(doc => doc.vectorNamespace);
    console.log('Document namespaces:', documentNamespaces);
    
    // Get previous messages for context
    const previousMessages = await Message.find({ chatId }).sort({ timestamp: 1 });
    console.log('Previous messages count:', previousMessages.length);
    
    // Process with RAG
    console.log('Processing with RAG...');
    const ragResponse = await enhancedRagService.processQuery(
      chatId,
      content,
      documentNamespaces,
      previousMessages
    );
    console.log('RAG response received:', ragResponse.answer.substring(0, 100) + '...');
    
    // Save assistant message
    const assistantMessage = new Message({
      chatId,
      role: 'assistant',
      content: ragResponse.answer,
      sources: ragResponse.sources
    });
    await assistantMessage.save();
    console.log('Assistant message saved');
    
    // Update chat timestamp
    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });
    
    res.json({
      userMessage,
      assistantMessage,
      sources: ragResponse.sources
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

// Get chat memory summary
router.get('/:id/memory', async (req, res) => {
  try {
    const memory = await enhancedRagService.getMemorySummary(req.params.id);
    res.json({ memory });
  } catch (error) {
    console.error('Error fetching memory:', error);
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

module.exports = router; 