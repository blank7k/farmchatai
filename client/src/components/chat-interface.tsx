import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useVoice } from "@/hooks/use-voice";
import { Mic, Send, Volume2, Paperclip, Bot, User, MicOff } from "lucide-react";

interface ChatInterfaceProps {
  farmerId: string;
  farmerProfile: any;
}

interface ChatMessage {
  id: string;
  message: string;
  response?: string;
  isVoice: boolean;
  timestamp: Date;
}

export default function ChatInterface({ farmerId, farmerProfile }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isRecording, startRecording, stopRecording, transcript, speak } = useVoice();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: chatMessages = [], refetch } = useQuery({
    queryKey: ["/api/chat", farmerId],
    enabled: !!farmerId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; isVoice: boolean }) => {
      const response = await apiRequest("POST", "/api/chat", {
        farmerId,
        message: data.message,
        isVoice: data.isVoice,
      });
      return response.json();
    },
    onSuccess: (data) => {
      refetch();
      if (data.response) {
        speak(data.response);
      }
    },
    onError: (error: any) => {
      toast({
        title: t("chat.error.title"),
        description: error.message || t("chat.error.description"),
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      message: message.trim(),
      isVoice: false,
    });
    setMessage("");
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    if (transcript && !isRecording) {
      setMessage(transcript);
      sendMessageMutation.mutate({
        message: transcript,
        isVoice: true,
      });
    }
  }, [transcript, isRecording]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    t("chat.suggestions.crops"),
    t("chat.suggestions.fertilizer"),
    t("chat.suggestions.pest"),
    t("chat.suggestions.weather"),
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {/* Welcome Message */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-primary-foreground" size={16} />
            </div>
            <div className="chat-bubble-ai p-4 rounded-lg max-w-[85%]">
              <p className="text-foreground mb-2">
                🌱 {t("chat.welcome.message", { name: farmerProfile?.name || t("chat.welcome.farmer") })}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMessage(question);
                      inputRef.current?.focus();
                    }}
                    className="bg-primary/10 text-primary hover:bg-primary/20 h-auto p-2 text-xs"
                    data-testid={`button-suggestion-${index}`}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          {(chatMessages as ChatMessage[]).map((msg: ChatMessage) => (
            <div key={msg.id}>
              {/* User Message */}
              <div className="flex items-start space-x-3 justify-end mb-4">
                <div className="chat-bubble-user p-4 rounded-lg max-w-[85%] text-primary-foreground">
                  <p>{msg.message}</p>
                  {msg.isVoice && (
                    <div className="flex items-center mt-2 text-xs opacity-75">
                      <Mic size={12} className="mr-1" />
                      {t("chat.voiceMessage")}
                    </div>
                  )}
                </div>
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-accent-foreground" size={16} />
                </div>
              </div>

              {/* AI Response */}
              {msg.response && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-primary-foreground" size={16} />
                  </div>
                  <div className="chat-bubble-ai p-4 rounded-lg max-w-[85%]">
                    <p className="text-foreground whitespace-pre-wrap">{msg.response}</p>
                    <div className="flex items-center space-x-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speak(msg.response!)}
                        className="p-2 bg-primary/10 hover:bg-primary/20"
                        data-testid={`button-speak-${msg.id}`}
                      >
                        <Volume2 size={14} className="text-primary" />
                      </Button>
                      <span className="text-xs text-muted-foreground">{t("chat.listen")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading State */}
          {sendMessageMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-primary-foreground" size={16} />
              </div>
              <div className="chat-bubble-ai p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <span className="text-sm text-muted-foreground ml-2">{t("chat.thinking")}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="bg-card border-t border-border p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("chat.placeholder")}
              className="pr-12 text-base h-12"
              disabled={sendMessageMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              data-testid="button-attach"
            >
              <Paperclip size={16} />
            </Button>
          </div>
          
          <Button
            onClick={handleVoiceToggle}
            disabled={sendMessageMutation.isPending}
            className={`w-12 h-12 rounded-full ${
              isRecording
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-accent hover:bg-accent/90"
            }`}
            data-testid="button-voice"
          >
            {isRecording ? (
              <MicOff className="text-destructive-foreground" size={20} />
            ) : (
              <Mic className="text-accent-foreground" size={20} />
            )}
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="w-12 h-12 rounded-full"
            data-testid="button-send"
          >
            <Send className="text-primary-foreground" size={20} />
          </Button>
        </div>
        
        {/* Voice Recording Indicator */}
        {isRecording && (
          <div className="mt-3 bg-accent/10 p-3 rounded-lg flex items-center space-x-3">
            <div className="w-6 h-6 bg-accent rounded-full voice-recording"></div>
            <span className="text-accent font-medium">{t("chat.listening")}</span>
            <Button
              onClick={stopRecording}
              variant="ghost"
              size="sm"
              className="ml-auto text-accent hover:text-accent/80"
              data-testid="button-stop-voice"
            >
              <MicOff size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
