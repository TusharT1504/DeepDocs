import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import HomePage from "./components/HomePage"
import ChatInterface from "./components/ChatInterface"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-white font-['Poppins',sans-serif]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/chat/:chatId" element={<ChatInterface />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#111111",
              color: "#ffffff",
              border: "1px solid #e5e7eb",
              fontFamily: "Poppins, sans-serif",
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
