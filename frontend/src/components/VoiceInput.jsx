import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

const VoiceInput = ({ isRecording, setIsRecording, onTranscript, disabled }) => {
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onstart = () => {
      console.log('Speech recognition started');
      setIsRecording(true);
      setError('');
    };

    recognitionInstance.onend = () => {
      console.log('Speech recognition ended');
      setIsRecording(false);
    };

    recognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        console.log('Final transcript:', finalTranscript);
        onTranscript(finalTranscript);
        recognitionInstance.stop();
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      setIsRecording(false);
    };

    recognitionRef.current = recognitionInstance;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, setIsRecording]);

  const toggleRecording = () => {
    if (!isSupported || disabled) return;

    if (isRecording) {
      console.log('Stopping recording...');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      console.log('Starting recording...');
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setError('Failed to start voice recording');
      }
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className="absolute right-2 bottom-2 p-1 text-gray-400 cursor-not-allowed"
        title="Voice input not supported in this browser"
      >
        <Mic size={16} />
      </button>
    );
  }

  return (
    <div className="absolute right-2 bottom-2">
      <button
        onClick={toggleRecording}
        disabled={disabled}
        className={`
          p-1 rounded-full transition-all duration-200
          ${isRecording
            ? 'bg-red-500 text-white voice-recording'
            : disabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
          }
        `}
        title={isRecording ? 'Stop recording' : 'Start voice input'}
      >
        {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
      </button>
      
      {error && (
        <div className="absolute bottom-8 right-0 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-600 max-w-48">
          <div className="flex items-center space-x-1">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInput; 