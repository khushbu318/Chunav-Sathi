import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MicOff, PhoneOff, Volume2, Mic } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

const languageMap: Record<string, string> = {
  'English': 'en-IN',
  'हिंदी': 'hi-IN',
  'বাংলা': 'bn-IN',
  'తెలుగు': 'te-IN',
  'मराठी': 'mr-IN',
  'தமிழ்': 'ta-IN',
  'ગુજરાતી': 'gu-IN',
  'ಕನ್ನಡ': 'kn-IN',
};

interface VoiceCallProps {
  onClose: () => void;
  selectedLanguage: string;
}

interface TranscriptLine {
  type: 'user' | 'bot';
  text: string;
}

export function VoiceCall({ onClose, selectedLanguage }: VoiceCallProps) {
  const [callState, setCallState] = useState<'listening' | 'processing' | 'speaking'>('listening');
  const [transcript, setTranscript] = useState<TranscriptLine[]>([
    { type: 'bot', text: 'Namaste! I am Chunav Sathi. How can I help you with elections today?' }
  ]);
  const [timer, setTimer] = useState(0);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript(prev => [...prev, { type: 'bot', text: 'Sorry, your browser does not support Voice Call.' }]);
      setCallState('processing');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = languageMap[selectedLanguage] || 'en-IN';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setCallState('listening');
    };

    recognition.onresult = async (event: any) => {
      const userText = event.results[0][0].transcript;
      setTranscript(prev => [...prev, { type: 'user', text: userText }]);
      setCallState('processing');
      await handleBotResponse(userText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'no-speech') {
        // Restart listening if no speech was detected
        setTimeout(() => {
           if (callState === 'listening') {
               try { recognitionRef.current?.start(); } catch (e) {}
           }
        }, 1000);
      } else {
        setCallState('processing');
      }
    };

    recognition.onend = () => {
      // If we are still supposed to be listening (e.g. it timed out without error), restart
      if (callState === 'listening') {
         try { recognitionRef.current?.start(); } catch (e) {}
      }
    };

    // Start listening initially
    try {
      recognition.start();
    } catch (e) {}

    return () => {
      try {
        recognition.stop();
        synthesisRef.current.cancel();
      } catch (e) {}
    };
  }, [selectedLanguage]);

  // Handle Call Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleBotResponse = async (userText: string) => {
    try {
      // Call the backend API with chat history
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userText, 
          history: chatHistory
        })
      });

      if (!res.ok) {
        throw new Error('Backend error');
      }

      const data = await res.json();
      const botResponse = data.response;

      // Update chat history with user and bot messages
      const updatedHistory = [
        ...chatHistory,
        { role: 'user', content: userText },
        { role: 'model', content: botResponse }
      ];
      setChatHistory(updatedHistory);

      // Update transcript display
      setTranscript(prev => [...prev, { type: 'bot', text: botResponse }]);
      
      setCallState('speaking');
      speakResponse(botResponse);
    } catch (err) {
      console.error('Error:', err);
      const errText = 'Sorry, I could not connect to the backend. Please try again.';
      setTranscript(prev => [...prev, { type: 'bot', text: errText }]);
      setCallState('speaking');
      speakResponse(errText);
    }
  };

  const speakResponse = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageMap[selectedLanguage] || 'en-IN';
    
    utterance.onend = () => {
      // After speaking, go back to listening
      setCallState('listening');
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    };

    utterance.onerror = () => {
      // If speech synthesis fails, still go back to listening
      setCallState('listening');
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    };

    synthesisRef.current.speak(utterance);
  };

  const endCall = () => {
    try {
      recognitionRef.current?.stop();
      synthesisRef.current.cancel();
    } catch (e) {}
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="call-overlay open"
    >
      <div className="text-center">
        <div className="text-[13px] text-white/50 mb-1">🎙 Voice call</div>
        <div className="text-[14px] text-[#4ade80]">
          {callState === 'listening' ? 'Listening...' : callState === 'processing' ? 'Processing...' : 'Speaking...'}
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="call-av relative">
          🤖
          {callState === 'speaking' && (
            <>
              <div className="cp1"></div>
              <div className="cp2"></div>
            </>
          )}
          {callState === 'listening' && (
             <div className="absolute inset-0 bg-whatsapp-green/20 rounded-full animate-ping"></div>
          )}
        </div>
        <div className="text-[22px] font-semibold text-white">Chunav Sathi AI</div>
        <div className="text-[14px] text-white/50">{formatTime(timer)}</div>
      </div>
      
      <div className="call-transcript max-w-sm w-full bg-black/20 p-4 rounded-xl backdrop-blur-md min-h-[120px] flex flex-col justify-end overflow-hidden">
        <div className="text-[11px] text-white/40 mb-2 uppercase tracking-wider text-center">Live transcript</div>
        <div className="flex flex-col gap-2">
          {transcript.map((t, i) => (
            <div key={i} className={`t-line ${t.type === 'user' ? 'user' : ''}`}>
              {t.type === 'bot' ? '🤖' : '👤'} {t.text}
            </div>
          ))}
        </div>
      </div>
      
      <div className="call-controls">
        <button className="c-btn mute" onClick={() => {
           if (callState === 'listening') {
             try { recognitionRef.current?.stop(); setCallState('processing'); } catch (e) {}
           } else {
             setCallState('listening');
             try { recognitionRef.current?.start(); } catch (e) {}
           }
        }}>
          {callState === 'listening' ? <Mic size={22} /> : <MicOff size={22} />}
        </button>
        <button className="c-btn end" onClick={endCall}><PhoneOff size={26} /></button>
        <button className="c-btn spk"><Volume2 size={22} /></button>
      </div>
    </motion.div>
  );
}