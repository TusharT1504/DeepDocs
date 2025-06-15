import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import DocumentManager from './DocumentManager';
import { Plus, Menu, X } from 'lucide-react';

const ChatInterface = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Load chat data when chatId changes
  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    } else if (chats.length > 0) {
      // Navigate to first chat if no chatId specified
      navigate(`/chat/${chats[0]._id}`);
    }
  }, [chatId, chats]);

  const fetchChats = async () => {
    try {
      setError(null);
      console.log('Fetching chats from:', '/api/chats');
      const response = await fetch('/api/chats');
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Chats data:', data);
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError(`Failed to load chats: ${error.message}. Please check if the backend server is running on port 5000.`);
    }
  };

  const loadChat = async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading chat with ID:', id);
      const response = await fetch(`/api/chats/${id}`);
      console.log('Load chat response status:', response.status);
      
      if (response.status === 404) {
        // Chat not found, create a new one
        console.log('Chat not found, creating new chat');
        await createNewChat();
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Chat data loaded:', data);
      setCurrentChat(data.chat);
      setMessages(data.messages);
      setDocuments(data.chat.documents || []);
    } catch (error) {
      console.error('Error loading chat:', error);
      setError(`Failed to load chat: ${error.message}. Creating new chat...`);
      
      // Try to create a new chat as fallback
      try {
        await createNewChat();
      } catch (createError) {
        console.error('Failed to create new chat:', createError);
        setError('Failed to load chat and create new one. Please check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      const newChat = await response.json();
      setChats(prev => [newChat, ...prev]);
      navigate(`/chat/${newChat._id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const deleteChat = async (id) => {
    try {
      await fetch(`/api/chats/${id}`, {
        method: 'DELETE',
      });
      setChats(prev => prev.filter(chat => chat._id !== id));
      if (currentChat?._id === id) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const updateChatTitle = async (id, title) => {
    try {
      const response = await fetch(`/api/chats/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      const updatedChat = await response.json();
      setChats(prev => prev.map(chat => 
        chat._id === id ? updatedChat : chat
      ));
      if (currentChat?._id === id) {
        setCurrentChat(updatedChat);
      }
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  const sendMessage = async (content) => {
    if (!currentChat) return;

    try {
      const response = await fetch(`/api/chats/${currentChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      
      // Add new messages to the list
      setMessages(prev => [...prev, data.userMessage, data.assistantMessage]);
      
      // Update chat timestamp
      setChats(prev => prev.map(chat => 
        chat._id === currentChat._id 
          ? { ...chat, updatedAt: new Date() }
          : chat
      ));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const uploadDocument = async (file) => {
    if (!currentChat) return;

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch(`/api/documents/upload/${currentChat._id}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      setDocuments(prev => [...prev, data.document]);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    }
  };

  const removeDocument = async (documentId) => {
    if (!currentChat) return;

    try {
      await fetch(`/api/documents/remove/${currentChat._id}/${documentId}`, {
        method: 'DELETE',
      });
      setDocuments(prev => prev.filter(doc => doc._id !== documentId));
    } catch (error) {
      console.error('Error removing document:', error);
      toast.error('Failed to remove document');
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchChats}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <ChatSidebar
          chats={chats}
          currentChat={currentChat}
          onCreateChat={createNewChat}
          onDeleteChat={deleteChat}
          onUpdateTitle={updateChatTitle}
          onSelectChat={(chat) => {
            navigate(`/chat/${chat._id}`);
            setSidebarOpen(false);
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {currentChat?.title || 'DeepDocs'}
            </h1>
          </div>
          
          <div className="text-sm text-gray-500">
            {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <ChatArea
              messages={messages}
              onSendMessage={sendMessage}
              loading={loading}
              currentChat={currentChat}
            />
          </div>

          {/* Document manager sidebar - always visible */}
          <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0">
            <DocumentManager
              documents={documents}
              onUpload={uploadDocument}
              onRemove={removeDocument}
              onClose={() => {}} // No-op since we want it always open
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 