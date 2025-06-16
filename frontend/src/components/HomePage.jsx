"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, ArrowRight, Sparkles } from "lucide-react"

const HomePage = () => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleGetStarted = () => {
    navigate("/chat")
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-32 w-1 h-1 bg-gray-300 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-gray-200 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-1 h-1 bg-gray-300 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div
        className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Logo with animation */}
        <div
          className={`flex items-center justify-center space-x-6 mb-12 transition-all duration-800 ${isLoaded ? "scale-100" : "scale-95"}`}
        >
          <div className="relative">
            <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-3">
              <FileText className="w-11 h-11 text-white" />
            </div>
            {/* Floating sparkle */}
            <Sparkles className="w-4 h-4 text-gray-400 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h1 className="text-7xl md:text-8xl font-bold text-[#111111] tracking-tight">DeepDocs</h1>
        </div>

        {/* Animated tagline */}
        <div
          className={`mb-16 transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <p className="text-3xl md:text-4xl text-gray-600 font-medium leading-relaxed mb-4">
            Chat with your PDF documents
          </p>
          <p className="text-2xl md:text-3xl text-gray-600 font-medium leading-relaxed">
            using <span className="text-[#111111] font-semibold">AI</span>
          </p>
        </div>

        {/* CTA Button with enhanced animation */}
        <div
          className={`mb-12 transition-all duration-1000 delay-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <button
            onClick={handleGetStarted}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group bg-black text-white px-16 py-6 rounded-3xl hover:bg-[#1f1f1f] transition-all duration-300 font-semibold text-2xl inline-flex items-center space-x-4 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <span className="relative z-10">Get Started</span>
            <ArrowRight
              className={`w-7 h-7 relative z-10 transition-all duration-300 ${isHovered ? "translate-x-2 scale-110" : ""}`}
            />
          </button>
        </div>

        {/* Process steps with stagger animation */}
        <div
          className={`flex items-center justify-center space-x-8 text-xl text-gray-500 transition-all duration-1000 delay-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="flex items-center space-x-2 group">
            <div className="w-3 h-3 bg-gray-400 rounded-full group-hover:bg-[#111111] transition-colors duration-300"></div>
            <span className="font-medium group-hover:text-[#111111] transition-colors duration-300">Upload</span>
          </div>

          <div className="w-8 h-0.5 bg-gray-300"></div>

          <div className="flex items-center space-x-2 group">
            <div className="w-3 h-3 bg-gray-400 rounded-full group-hover:bg-[#111111] transition-colors duration-300"></div>
            <span className="font-medium group-hover:text-[#111111] transition-colors duration-300">Ask</span>
          </div>

          <div className="w-8 h-0.5 bg-gray-300"></div>

          <div className="flex items-center space-x-2 group">
            <div className="w-3 h-3 bg-gray-400 rounded-full group-hover:bg-[#111111] transition-colors duration-300"></div>
            <span className="font-medium group-hover:text-[#111111] transition-colors duration-300">Get Answers</span>
          </div>
        </div>

        {/* Floating call-to-action hint */}
        <div
          className={`mt-16 transition-all duration-1000 delay-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <p className="text-lg text-gray-400 animate-pulse">✨ Transform your documents into conversations</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
