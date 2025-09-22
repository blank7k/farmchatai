import { useState, useEffect, useCallback } from "react";

interface UseVoiceReturn {
  isRecording: boolean;
  transcript: string;
  startRecording: () => void;
  stopRecording: () => void;
  speak: (text: string) => void;
  isSupported: boolean;
}

export function useVoice(): UseVoiceReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any | null>(null);
  const [synthesis] = useState(() => window.speechSynthesis);

  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) &&
    "speechSynthesis" in window;

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = "en-IN"; // English (India) for better Malayalam-English mix
    
    recognitionInstance.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };
    
    recognitionInstance.onend = () => {
      setIsRecording(false);
    };
    
    recognitionInstance.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };
    
    setRecognition(recognitionInstance);
  }, [isSupported]);

  const startRecording = useCallback(() => {
    if (!recognition || isRecording) return;
    
    setTranscript("");
    setIsRecording(true);
    recognition.start();
  }, [recognition, isRecording]);

  const stopRecording = useCallback(() => {
    if (!recognition || !isRecording) return;
    
    recognition.stop();
    setIsRecording(false);
  }, [recognition, isRecording]);

  const speak = useCallback((text: string) => {
    if (!synthesis || !text) return;
    
    // Stop any ongoing speech
    synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    synthesis.speak(utterance);
  }, [synthesis]);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    speak,
    isSupported
  };
}
