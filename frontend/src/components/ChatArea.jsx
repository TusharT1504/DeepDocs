"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Send, FileText, Sparkles } from "lucide-react"
import MessageBubble from "./MessageBubble"
import VoiceInput from "./VoiceInput"

// Enhanced Loading message component
const LoadingMessage = React.memo(() => (
  <div className="flex justify-start mb-6 animate-in slide-in-from-left-4 duration-500">
    <div className="max-w-4xl mr-16">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>

        <div className="flex items-center mb-5 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center">
              <div className="w-5 h-5 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-700">AI Assistant</span>
                <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <div className="h-3 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-4/5"></div>
          <div className="h-3 bg-gray-200 rounded-lg animate-pulse w-3/5"></div>
        </div>
      </div>
    </div>
  </div>
))

LoadingMessage.displayName = "LoadingMessage"

const ChatArea = React.memo(({ messages, onSendMessage, loading, currentChat }) => {
  const [inputValue, setInputValue] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleSendMessage = useCallback(() => {
    if (inputValue.trim() && !loading) {
      onSendMessage(inputValue.trim())
      setInputValue("")
    }
  }, [inputValue, loading, onSendMessage])

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  const handleVoiceInput = useCallback((transcript) => {
    setInputValue(transcript)
    inputRef.current?.focus()
  }, [])

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value)
  }, [])

  // Enhanced empty state
  const emptyState = useMemo(
    () => (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center text-gray-600 max-w-lg mx-auto animate-in fade-in-50 duration-1000">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <FileText className="w-10 h-10 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
            <Sparkles className="w-3 h-3 text-yellow-500 absolute translate-x-6 -translate-y-6 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-black">Welcome to DeepDocs</h3>
          <p className="text-base mb-6 text-gray-600 leading-relaxed font-medium">
            Upload PDF documents and start having intelligent conversations with your content
          </p>
          {currentChat?.documents?.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 inline-block">
              <p className="text-sm text-yellow-700 font-medium">
                💡 No documents uploaded yet. Upload some PDFs to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    ),
    [currentChat?.documents?.length],
  )

  // Memoized messages
  const messageList = useMemo(
    () => messages.map((message) => <MessageBubble key={message._id} message={message} />),
    [messages],
  )

  const canSend = inputValue.trim() && !loading

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 min-h-0">
        {messages.length === 0 ? emptyState : messageList}

        {loading && <LoadingMessage />}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input area */}
      <div className="border-t border-gray-200 p-6 bg-white flex-shrink-0">
        <div className="flex items-end space-x-4 max-w-5xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice input..."
              className="w-full px-6 py-4 pr-14 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black resize-none bg-white text-black placeholder-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-sm"
              rows="1"
              style={{ minHeight: "56px", maxHeight: "120px" }}
              disabled={loading}
            />

            <VoiceInput
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              onTranscript={handleVoiceInput}
              disabled={loading}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!canSend}
            className={`
              p-4 rounded-2xl transition-all duration-300 flex-shrink-0 shadow-lg hover:shadow-xl group relative overflow-hidden
              ${
                canSend
                  ? "bg-black hover:bg-gray-900 text-white hover:-translate-y-1 hover:scale-105"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
            aria-label="Send message"
          >
            {canSend && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            )}
            <Send className="w-6 h-6 relative z-10" />
          </button>
        </div>

        {/* Enhanced Document info */}
        {currentChat?.documents?.length > 0 && (
          <div className="mt-2 text-center animate-in slide-in-from-bottom-2 duration-500">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium">
                Chat has access to {currentChat.documents.length} document
                {currentChat.documents.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

ChatArea.displayName = "ChatArea"

export default ChatArea
