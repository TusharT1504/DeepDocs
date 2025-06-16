"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import toast from "react-hot-toast"
import ChatSidebar from "./ChatSidebar"
import ChatArea from "./ChatArea"
import DocumentManager from "./DocumentManager"
import { Menu, X, FileText, Home } from "lucide-react"

const ChatInterface = React.memo(() => {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [docManagerOpen, setDocManagerOpen] = useState(false)
  const [error, setError] = useState(null)

  // Memoized handlers for performance
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const handleDocManagerToggle = useCallback(() => {
    setDocManagerOpen((prev) => !prev)
  }, [])

  const handleSelectChat = useCallback(
    (chat) => {
      navigate(`/chat/${chat._id}`)
      setSidebarOpen(false)
    },
    [navigate],
  )

  const handleGoHome = useCallback(() => {
    navigate("/")
  }, [navigate])

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats()
  }, [])

  // Load chat data when chatId changes
  useEffect(() => {
    if (chatId) {
      loadChat(chatId)
    } else if (chats.length > 0) {
      navigate(`/chat/${chats[0]._id}`)
    } else {
      // If no chatId and no chats, create a new one
      createNewChat()
    }
  }, [chatId, chats, navigate])

  // Auto-create new chat when navigating to /chat without chatId
  useEffect(() => {
    if (location.pathname === '/chat' && !chatId && chats.length === 0) {
      createNewChat()
    }
  }, [location.pathname, chatId, chats])

  const fetchChats = async () => {
    try {
      setError(null)
      const response = await fetch("/api/chats")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setChats(data)
    } catch (error) {
      console.error("Error fetching chats:", error)
      setError(`Failed to load chats: ${error.message}. Please check if the backend server is running on port 5000.`)
    }
  }

  const loadChat = async (id) => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/chats/${id}`)

      if (response.status === 404) {
        await createNewChat()
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setCurrentChat(data.chat)
      setMessages(data.messages)
      setDocuments(data.chat.documents || [])
    } catch (error) {
      console.error("Error loading chat:", error)
      setError(`Failed to load chat: ${error.message}. Creating new chat...`)

      try {
        await createNewChat()
      } catch (createError) {
        console.error("Failed to create new chat:", createError)
        setError("Failed to load chat and create new one. Please check backend connection.")
      }
    } finally {
      setLoading(false)
    }
  }

  const createNewChat = useCallback(async () => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "New Chat" }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const newChat = await response.json()
      
      // Set the current chat immediately
      setCurrentChat(newChat)
      setMessages([])
      setDocuments([])
      
      // Update chats list
      setChats((prev) => [newChat, ...prev])
      
      // Navigate to the new chat
      navigate(`/chat/${newChat._id}`)
    } catch (error) {
      console.error("Error creating chat:", error)
      toast.error("Failed to create new chat")
    }
  }, [navigate])

  const deleteChat = useCallback(
    async (id) => {
      try {
        await fetch(`/api/chats/${id}`, {
          method: "DELETE",
        })
        setChats((prev) => prev.filter((chat) => chat._id !== id))
        if (currentChat?._id === id) {
          navigate("/chat")
        }
        toast.success("Chat deleted")
      } catch (error) {
        console.error("Error deleting chat:", error)
        toast.error("Failed to delete chat")
      }
    },
    [currentChat, navigate],
  )

  const updateChatTitle = useCallback(
    async (id, title) => {
      try {
        const response = await fetch(`/api/chats/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title }),
        })
        const updatedChat = await response.json()
        setChats((prev) => prev.map((chat) => (chat._id === id ? updatedChat : chat)))
        if (currentChat?._id === id) {
          setCurrentChat(updatedChat)
        }
      } catch (error) {
        console.error("Error updating chat title:", error)
        toast.error("Failed to update chat title")
      }
    },
    [currentChat],
  )

  const sendMessage = useCallback(
    async (content) => {
      if (!currentChat) {
        console.error("No current chat available")
        toast.error("No chat available")
        return
      }

      console.log("Sending message to chat:", currentChat._id, "Content:", content)

      const userMessage = {
        _id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setLoading(true)

      try {
        console.log("Making API request to:", `/api/chats/${currentChat._id}/messages`)
        const response = await fetch(`/api/chats/${currentChat._id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        })

        console.log("Response status:", response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error("API Error:", response.status, errorText)
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        const data = await response.json()
        console.log("Response data:", data)

        setMessages((prev) => [...prev.slice(0, -1), data.userMessage, data.assistantMessage])

        setChats((prev) =>
          prev.map((chat) => (chat._id === currentChat._id ? { ...chat, updatedAt: new Date() } : chat)),
        )
      } catch (error) {
        console.error("Error sending message:", error)
        toast.error(`Failed to send message: ${error.message}`)
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setLoading(false)
      }
    },
    [currentChat],
  )

  const uploadDocument = useCallback(
    async (file) => {
      if (!currentChat) return

      const formData = new FormData()
      formData.append("document", file)

      try {
        const response = await fetch(`/api/documents/upload/${currentChat._id}`, {
          method: "POST",
          body: formData,
        })
        const data = await response.json()

        setDocuments((prev) => [...prev, data.document])
        toast.success("Document uploaded successfully")
      } catch (error) {
        console.error("Error uploading document:", error)
        toast.error("Failed to upload document")
      }
    },
    [currentChat],
  )

  const removeDocument = useCallback(
    async (documentId) => {
      if (!currentChat) return

      try {
        await fetch(`/api/documents/remove/${currentChat._id}/${documentId}`, {
          method: "DELETE",
        })
        setDocuments((prev) => prev.filter((doc) => doc._id !== documentId))
        toast.success("Document removed")
      } catch (error) {
        console.error("Error removing document:", error)
        toast.error("Failed to remove document")
      }
    },
    [currentChat],
  )

  const documentCount = useMemo(() => documents.length, [documents.length])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-4 font-['Poppins',sans-serif]">
        <div className="text-center p-6 sm:p-8 bg-white rounded-xl shadow-lg max-w-md w-full border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-[#111111] mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchChats}
              className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-[#1f1f1f] transition-colors font-medium"
            >
              Retry Connection
            </button>
            <button
              onClick={handleGoHome}
              className="w-full bg-[#f9f9f9] text-[#111111] px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden font-['Poppins',sans-serif]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 sm:w-72 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <ChatSidebar
          chats={chats}
          currentChat={currentChat}
          onCreateChat={createNewChat}
          onDeleteChat={deleteChat}
          onUpdateTitle={updateChatTitle}
          onSelectChat={handleSelectChat}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={handleSidebarToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-[#f9f9f9] transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleGoHome}
              className="p-2 rounded-lg hover:bg-[#f9f9f9] transition-colors"
              aria-label="Go to home"
            >
              <Home className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-[#111111] truncate">{currentChat?.title || "DeepDocs"}</h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-sm text-gray-600">
              {documentCount} document{documentCount !== 1 ? "s" : ""}
            </div>
            <button
              onClick={handleDocManagerToggle}
              className="xl:hidden p-2 rounded-lg hover:bg-[#f9f9f9] transition-colors"
              aria-label="Toggle documents"
            >
              <FileText className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <ChatArea messages={messages} onSendMessage={sendMessage} loading={loading} currentChat={currentChat} />
          </div>

          {/* Document manager - responsive */}
          <div
            className={`
            ${docManagerOpen ? "fixed" : "hidden"} xl:block xl:static
            inset-y-0 right-0 z-30 w-80 sm:w-72 bg-white border-l border-gray-200 
            flex-shrink-0 transform transition-transform duration-300 ease-in-out
          `}
          >
            <DocumentManager
              documents={documents}
              onUpload={uploadDocument}
              onRemove={removeDocument}
              onClose={() => setDocManagerOpen(false)}
            />
          </div>
        </div>

        {/* Mobile document manager overlay */}
        {docManagerOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 xl:hidden"
            onClick={() => setDocManagerOpen(false)}
          />
        )}
      </div>
    </div>
  )
})

ChatInterface.displayName = "ChatInterface"

export default ChatInterface
