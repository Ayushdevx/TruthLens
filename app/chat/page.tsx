"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Send,
  Loader2,
  Trash2,
  Settings,
  Image as ImageIcon,
  Download,
} from 'lucide-react';
import Background3D from '@/components/Background3D';
import ChatMessage from '@/components/chat/ChatMessage';
import VoiceInput from '@/components/chat/VoiceInput';
import { loadChatHistory, saveChatHistory, clearChatHistory } from '@/lib/utils/chatStorage';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyCCYguhAkip0xMgN1074yYTYpn2SfLcL10';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function generateAIResponse(prompt) {
  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
      throw new Error('Invalid response format from API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Detailed Error:', error);
    throw new Error(error.message || 'Failed to communicate with AI service');
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    const history = loadChatHistory();
    if (history.length > 0) {
      setMessages(history);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = { 
      role: 'user', 
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await generateAIResponse(input);

      // Format the AI response for markdown-like formatting
      const formattedResponse = aiResponse
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold formatting
        .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italics formatting

      const aiMessage = { 
        role: 'assistant', 
        content: formattedResponse,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: `Error: ${error.message}. Please try again.`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  const handleClearHistory = () => {
    setMessages([]);
    clearChatHistory();
    toast.success('Chat history cleared');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Can add additional handling for image file
      toast.success('Image uploaded successfully');
    }
  };

  const downloadChatAsPDF = () => {
    const pdf = new jsPDF();
    const chatContainer = document.getElementById('chat-container');

    html2canvas(chatContainer).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save(`chat-${new Date().toISOString()}.pdf`);
    });
  };

  return (
    <>
      <Background3D />
      <div className="min-h-screen pt-20 px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
              TruthLens AI Assistant
            </h1>
            <div className="flex gap-2">
              {messages.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={downloadChatAsPDF}
                    className="text-gray-500 hover:text-gray-600"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearHistory}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <Card id="chat-container" className="p-4 h-[600px] flex flex-col backdrop-blur-lg bg-background/80">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.timestamp}
                  message={message}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
              />
              <Button onClick={handleSend} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <VoiceInput onTranscript={(transcript) => setInput(transcript)} />
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
}