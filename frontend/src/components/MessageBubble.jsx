import React, { useState } from 'react';
import { User, Bot, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message }) => {
  const [showSources, setShowSources] = useState(false);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`
          message-bubble ${isUser ? 'message-user' : 'message-assistant'}
          ${isUser ? 'ml-12' : 'mr-12'}
        `}>
          {/* Message header */}
          <div className={`flex items-center space-x-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-center space-x-2 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div className={`
                p-1 rounded-full
                ${isUser ? 'bg-primary-700' : 'bg-gray-200'}
              `}>
                {isUser ? (
                  <User size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-gray-600" />
                )}
              </div>
              <span className="text-xs opacity-75">
                {isUser ? 'You' : 'AI Assistant'}
              </span>
              <span className="text-xs opacity-50">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>

          {/* Message content */}
          <div className="text-sm leading-relaxed">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Sources */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FileText size={12} />
                <span>{message.sources.length} source{message.sources.length !== 1 ? 's' : ''}</span>
                {showSources ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              
              {showSources && (
                <div className="mt-2 space-y-2">
                  {message.sources.map((source, index) => (
                    <div key={index} className="bg-gray-50 rounded p-2 text-xs">
                      <div className="font-medium text-gray-700">
                        {source.document}
                        {source.page && ` (Page ${source.page})`}
                      </div>
                      <div className="text-gray-600 mt-1">
                        {source.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 