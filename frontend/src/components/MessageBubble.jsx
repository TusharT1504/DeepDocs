"use client"

import React, { useState, useCallback, useEffect } from "react"
import { User, Bot, FileText, ChevronDown, ChevronUp, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"

const MessageBubble = React.memo(({ message }) => {
  const [showSources, setShowSources] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const formatTimestamp = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [])

  const toggleSources = useCallback(() => {
    setShowSources((prev) => !prev)
  }, [])

  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className={`max-w-4xl ${isUser ? "ml-16" : "mr-16"} group`}>
        <div
          className={`
          rounded-3xl p-6 shadow-lg border transition-all duration-300 relative overflow-hidden
          ${
            isUser
              ? "bg-black text-white border-black shadow-black/20 hover:shadow-black/30 hover:shadow-xl"
              : "bg-white text-black border-gray-200 shadow-gray-200/50 hover:shadow-gray-300/60 hover:shadow-xl hover:border-gray-300"
          }
          hover:-translate-y-1 hover:scale-[1.02]
        `}
        >
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>

          {/* Message header with more spacing */}
          <div className={`flex items-center mb-5 ${isUser ? "justify-end" : "justify-start"} relative z-10`}>
            <div className={`flex items-center ${isUser ? "flex-row-reverse space-x-reverse space-x-4" : "space-x-4"}`}>
              <div
                className={`
                w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110
                ${isUser ? "bg-gray-800" : "bg-gray-100"}
              `}
              >
                {isUser ? <User className="w-5 h-5 text-gray-200" /> : <Bot className="w-5 h-5 text-gray-600" />}
              </div>
              <div className={`${isUser ? "text-right" : "text-left"}`}>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${isUser ? "text-gray-200" : "text-gray-700"}`}>
                    {isUser ? "You" : "AI Assistant"}
                  </span>
                  {!isUser && <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />}
                </div>
                <div className={`text-xs mt-1 ${isUser ? "text-gray-400" : "text-gray-500"}`}>
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          </div>

          {/* Message content with smaller text */}
          <div className="text-sm leading-relaxed relative z-10">
            {isUser ? (
              <p className="whitespace-pre-wrap font-medium">{message.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0 text-black leading-relaxed font-medium">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-3 space-y-1 text-black ml-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-3 space-y-1 text-black ml-2">{children}</ol>
                    ),
                    li: ({ children }) => <li className="text-sm text-black font-medium">{children}</li>,
                    code: ({ children }) => (
                      <code className="bg-gray-100 text-black px-2 py-1 rounded-lg text-xs font-mono shadow-sm border border-gray-200">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-100 p-3 rounded-xl text-xs overflow-x-auto mb-3 border border-gray-200 shadow-inner">
                        {children}
                      </pre>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold mb-2 text-black border-b border-gray-200 pb-2">{children}</h1>
                    ),
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-black">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 text-black">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-400 pl-3 italic text-gray-700 mb-3 bg-gray-50 py-2 rounded-r-lg">
                        {children}
                      </blockquote>
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
            <div className="mt-5 pt-4 border-t border-gray-200 relative z-10">
              <button
                onClick={toggleSources}
                className="flex items-center space-x-3 text-xs text-gray-600 hover:text-black transition-all duration-300 group/sources p-2 rounded-xl hover:bg-gray-100"
              >
                <div className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center group-hover/sources:scale-110 transition-transform duration-300">
                  <FileText className="w-3 h-3" />
                </div>
                <span className="font-semibold">
                  {message.sources.length} source{message.sources.length !== 1 ? "s" : ""}
                </span>
                <div className="transition-transform duration-300 group-hover/sources:scale-110">
                  {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              </button>

              {showSources && (
                <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  {message.sources.map((source, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-3 text-xs border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="font-semibold text-black mb-2 flex items-center space-x-2">
                        <div className="w-5 h-5 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FileText className="w-2 h-2 text-gray-600" />
                        </div>
                        <span>
                          {source.document}
                          {source.page && <span className="text-gray-500 font-normal ml-1">(Page {source.page})</span>}
                        </span>
                      </div>
                      <div className="text-gray-700 leading-relaxed font-medium pl-7">{source.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

MessageBubble.displayName = "MessageBubble"

export default MessageBubble
