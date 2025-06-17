"use client"

import React, { useState, useCallback } from "react"
import { Plus, Edit3, Trash2, MessageSquare, X, Check } from "lucide-react"

const ChatSidebar = React.memo(({ chats, currentChat, onCreateChat, onDeleteChat, onUpdateTitle, onSelectChat }) => {
  const [editingChat, setEditingChat] = useState(null)
  const [editTitle, setEditTitle] = useState("")

  const handleEditClick = useCallback((chat) => {
    setEditingChat(chat._id)
    setEditTitle(chat.title)
  }, [])

  const handleSaveTitle = useCallback(() => {
    if (editTitle.trim()) {
      onUpdateTitle(editingChat, editTitle.trim())
    }
    setEditingChat(null)
    setEditTitle("")
  }, [editTitle, editingChat, onUpdateTitle])

  const handleCancelEdit = useCallback(() => {
    setEditingChat(null)
    setEditTitle("")
  }, [])

  const handleDeleteChat = useCallback(
    (chatId) => {
      if (window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
        onDeleteChat(chatId)
      }
    },
    [onDeleteChat],
  )

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSaveTitle()
      } else if (e.key === "Escape") {
        handleCancelEdit()
      }
    },
    [handleSaveTitle, handleCancelEdit],
  )

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#111111]">Chats</h2>
          <button
            onClick={onCreateChat}
            className="p-2 rounded-lg hover:bg-[#f9f9f9] transition-colors group"
            title="New Chat"
            aria-label="Create new chat"
          >
            <Plus className="w-5 h-5 text-gray-600 group-hover:text-[#111111]" />
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <div className="w-12 h-12 bg-[#f9f9f9] rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-medium text-[#111111] mb-1">No chats yet</p>
            <p className="text-sm text-gray-600">Create your first chat to get started</p>
          </div>
        ) : (
          <div className="p-2">
            {chats.map((chat) => (
              <div
                key={chat._id}
                className={`
                  group relative p-3 rounded-xl mb-2 cursor-pointer transition-all duration-200
                  ${
                    currentChat?._id === chat._id
                      ? "bg-black text-white shadow-sm"
                      : "hover:bg-[#f9f9f9] text-[#111111]"
                  }
                `}
                onClick={() => onSelectChat(chat)}
              >
                {editingChat === chat._id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white text-[#111111]"
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSaveTitle()
                      }}
                      className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      aria-label="Save title"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCancelEdit()
                      }}
                      className="p-1 text-gray-600 hover:bg-[#f9f9f9] rounded-lg transition-colors"
                      aria-label="Cancel edit"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-sm font-medium truncate mb-1 ${
                          currentChat?._id === chat._id ? "text-white" : "text-[#111111]"
                        }`}
                      >
                        {chat.title}
                      </h3>
                      <p className={`text-xs ${currentChat?._id === chat._id ? "text-gray-300" : "text-gray-600"}`}>
                        {new Date(chat.updatedAt).toLocaleDateString()} • {chat.documents?.length || 0} docs
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditClick(chat)
                        }}
                        className={`p-1 rounded-lg transition-colors ${
                          currentChat?._id === chat._id
                            ? "text-gray-300 hover:text-white hover:bg-gray-800"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        }`}
                        title="Edit title"
                        aria-label="Edit chat title"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteChat(chat._id)
                        }}
                        className={`p-1 rounded-lg transition-colors ${
                          currentChat?._id === chat._id
                            ? "text-gray-300 hover:text-red-300 hover:bg-gray-800"
                            : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                        }`}
                        title="Delete chat"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="text-xs text-gray-600 text-center font-medium">DeepDocs</div>
      </div>
    </div>
  )
})

ChatSidebar.displayName = "ChatSidebar"

export default ChatSidebar
