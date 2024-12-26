"use client";

import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatMessage({ message, isTyping }) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleReaction = (type) => {
    if (type === 'like') {
      setLiked(!liked);
      setDisliked(false);
    } else {
      setDisliked(!disliked);
      setLiked(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-start gap-3 ${
        message.role === 'user' ? 'flex-row-reverse' : ''
      }`}
    >
      <div className={`p-2 rounded-full ${
        message.role === 'user' ? 'bg-primary' : 'bg-blue-500'
      }`}>
        {message.role === 'user' ? (
          <User className="h-5 w-5 text-primary-foreground" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`group relative flex-1 p-4 rounded-lg ${
          message.role === 'user' 
            ? 'bg-primary/10 ml-12' 
            : 'bg-blue-500/10 mr-12'
        }`}
      >
        {message.content}
        {isTyping && (
          <span className="ml-2 animate-pulse">...</span>
        )}
        
        {message.role === 'assistant' && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleReaction('like')}
              className={liked ? 'text-green-500' : ''}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleReaction('dislike')}
              className={disliked ? 'text-red-500' : ''}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}