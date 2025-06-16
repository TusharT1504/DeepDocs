"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, AlertCircle } from "lucide-react"

const VoiceInput = React.memo(({ isRecording, setIsRecording, onTranscript, disabled }) => {
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState("")
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check if speech recognition is supported
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setIsSupported(false)
      return
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognitionInstance = new SpeechRecognition()

    recognitionInstance.continuous = true
    recognitionInstance.interimResults = true
    recognitionInstance.lang = "en-US"

    recognitionInstance.onstart = () => {
      setIsRecording(true)
      setError("")
    }

    recognitionInstance.onend = () => {
      setIsRecording(false)
    }

    recognitionInstance.onresult = (event) => {
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        }
      }

      if (finalTranscript) {
        onTranscript(finalTranscript)
        recognitionInstance.stop()
      }
    }

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setError(event.error)
      setIsRecording(false)
    }

    recognitionRef.current = recognitionInstance

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscript, setIsRecording])

  const toggleRecording = useCallback(() => {
    if (!isSupported || disabled) return

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start()
        }
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setError("Failed to start voice recording")
      }
    }
  }, [isSupported, disabled, isRecording])

  if (!isSupported) {
    return (
      <button
        disabled
        className="absolute right-3 bottom-3 p-2 text-gray-400 cursor-not-allowed rounded-lg"
        title="Voice input not supported in this browser"
        aria-label="Voice input not supported"
      >
        <Mic className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="absolute right-3 bottom-3">
      <button
        onClick={toggleRecording}
        disabled={disabled}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${
            isRecording
              ? "bg-red-500 text-white shadow-lg animate-pulse"
              : disabled
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-[#111111] hover:bg-[#f9f9f9]"
          }
        `}
        title={isRecording ? "Stop recording" : "Start voice input"}
        aria-label={isRecording ? "Stop voice recording" : "Start voice recording"}
      >
        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>

      {error && (
        <div className="absolute bottom-12 right-0 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-600 max-w-48 shadow-lg">
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  )
})

VoiceInput.displayName = "VoiceInput"

export default VoiceInput
