import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, FileText, X } from 'lucide-react';
import MessageBubble from './MessageBubble';
import VoiceInput from './VoiceInput';

const ChatArea = ({ messages, onSendMessage, loading, currentChat }) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !loading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = (transcript) => {
    setInputValue(transcript);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area - scrollable container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <FileText size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Welcome to DeepDocs</h3>
              <p className="text-sm mb-4">
                Upload PDF documents and start chatting with your content
              </p>
              {currentChat?.documents?.length === 0 && (
                <p className="text-xs text-gray-400">
                  No documents uploaded yet. Upload some PDFs to get started.
                </p>
              )}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message._id} message={message} />
          ))
        )}
        
        {loading && (
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-lg p-4 max-w-3xl">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span>AI is thinking</span>
                <span className="loading-dots"></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area - fixed at bottom */}
      <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={loading}
            />
            
            {/* Voice input button */}
            <VoiceInput
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              onTranscript={handleVoiceInput}
              disabled={loading}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || loading}
            className={`
              p-2 rounded-lg transition-colors
              ${inputValue.trim() && !loading
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Document info */}
        {currentChat?.documents?.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Chat has access to {currentChat.documents.length} document{currentChat.documents.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea; 