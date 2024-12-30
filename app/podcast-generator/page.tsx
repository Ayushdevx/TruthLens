"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Play, Download } from 'lucide-react';
import { WavyBackground } from '@/components/ui/wavy-background';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// API Configuration (for testing only - not for production)
const GEMINI_API_KEY = 'AIzaSyCCYguhAkip0xMgN1074yYTYpn2SfLcL10';
const PLAYHT_USER_ID = 'iSLGGCwvJ1RImLmWrOHs7eB0CM52';
const PLAYHT_SECRET_KEY = '20b238719585497b8d6cfddc262f81de';

// Types
interface Voice {
  id: string;
  name: string;
}

interface PodcastState {
  content: string;
  title: string;
  selectedVoice: string;
  loading: boolean;
  generatingScript: boolean;
  audioUrl: string;
  script: string;
}

const VOICES: Voice[] = [
  { id: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs', name: 'Female Voice 1' },
  { id: 's3://voice-cloning-zero-shot/7c38b588-14e8-42b9-bacd-e03d1d673c3c/male-cs', name: 'Male Voice 1' }
];

const DEFAULT_STATE: PodcastState = {
  content: '',
  title: '',
  selectedVoice: VOICES[0].id,
  loading: false,
  generatingScript: false,
  audioUrl: '',
  script: '',
};

const PodcastGeneratorPage = () => {
  const [state, setState] = useState<PodcastState>(DEFAULT_STATE);
  const { toast } = useToast();

  const updateState = (updates: Partial<PodcastState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleError = (error: Error, message: string) => {
    console.error('Error details:', error);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
    updateState({ loading: false, generatingScript: false });
  };

  const formatScript = (script: string) => {
    return script.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h3 key={index} className="font-bold text-lg mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </h3>
        );
      }
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  const generatePodcastScript = async (content: string): Promise<string> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create a natural, conversational podcast script about the following topic. 
                     Include an introduction, clear segments, and a conclusion.
                     Use casual language and add appropriate transitions between topics.
                     Topic: ${content}`
            }]
          }]
        })
      });

      console.log('Gemini API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error Details:', errorData);
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Gemini API Response Data:', data);

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Script Generation Error:", error);
      handleError(error instanceof Error ? error : new Error('Failed to generate script'), 'Failed to generate script');
      return ''; // Ensuring a string return
    }
  };

  const generateAudio = async (text: string): Promise<string> => {
    try {
      // First, get the access token
      const tokenResponse = await fetch('https://api.play.ht/api/v2/token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PLAYHT_SECRET_KEY}`,
          'X-User-ID': PLAYHT_USER_ID,
        },
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get PlayHT access token');
      }

      const { access_token } = await tokenResponse.json();

      // Now create the audio conversion request
      const createResponse = await fetch('https://api.play.ht/api/v2/tts/convert', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'X-User-ID': PLAYHT_USER_ID,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: state.selectedVoice,
          quality: 'medium', // Changed to medium as premium might not be available
          output_format: 'mp3',
          speed: 1.0,
          sample_rate: 24000,
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('PlayHT API Error:', errorData);
        throw new Error(errorData.message || 'Failed to initiate audio conversion');
      }

      const { id: transcriptionId } = await createResponse.json();
      console.log('Transcription ID:', transcriptionId);

      return await pollAudioStatus(transcriptionId, access_token);
    } catch (error) {
      console.error("Audio Generation Error:", error);
      throw error;
    }
  };

  const pollAudioStatus = async (transcriptionId: string, access_token: string): Promise<string> => {
    const maxAttempts = 30;
    const pollInterval = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const statusResponse = await fetch(`https://api.play.ht/api/v2/tts/status/${transcriptionId}`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'X-User-ID': PLAYHT_USER_ID,
          }
        });

        if (!statusResponse.ok) {
          throw new Error('Failed to check audio status');
        }

        const status = await statusResponse.json();
        console.log('Status response:', status);
        
        if (status.completed) {
          return status.url;
        }
        
        if (status.error) {
          throw new Error(`Audio generation failed: ${status.error}`);
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error("Polling Error:", error);
        throw error;
      }
    }

    throw new Error('Audio generation timed out');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      updateState({ content: text });
      toast({
        title: "File uploaded successfully",
        description: "Content loaded. Ready to generate podcast.",
      });
    } catch (error) {
      handleError(error as Error, "Failed to upload file. Please try again with a valid text file.");
    }
  };

  const handleGenerate = async () => {
    if (!state.content.trim() || state.loading) return;

    updateState({ loading: true, generatingScript: true });
    
    try {
      const script = await generatePodcastScript(state.content);
      updateState({ script, generatingScript: false });

      toast({
        title: "Script generated",
        description: "Converting to audio...",
      });

      const url = await generateAudio(script);
      updateState({ audioUrl: url });

      toast({
        title: "Success!",
        description: "Your podcast has been generated.",
      });
    } catch (error) {
      handleError(error as Error, (error as Error).message);
    } finally {
      updateState({ loading: false });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <WavyBackground className="opacity-50" />
      </div>

      {/* Main content */}
      <main className="flex-grow relative z-10 container mx-auto px-4 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            AI Podcast Generator
          </h1>

          <Card className="p-6 bg-black/80 backdrop-blur-sm text-white shadow-xl border-gray-800">
            <div className="space-y-6">
              <Input
                placeholder="Podcast Title"
                value={state.title}
                onChange={(e) => updateState({ title: e.target.value })}
                className="mb-4 bg-gray-800/50 text-white border-gray-700"
              />

              <Textarea
                placeholder="Enter your content or upload a file... The AI will transform this into an engaging podcast script."
                value={state.content}
                onChange={(e) => updateState({ content: e.target.value })}
                className="min-h-[200px] bg-gray-800/50 text-white border-gray-700"
              />

              <Select 
                value={state.selectedVoice} 
                onValueChange={(value) => updateState({ selectedVoice: value })}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-700">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <Button
                  onClick={handleGenerate}
                  disabled={state.loading || !state.content.trim()}
                  className="flex-1 bg-gradient-to-r from-primary to-blue-500"
                >
                  {state.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {state.generatingScript ? 'Generating Script...' : 'Creating Audio...'}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Podcast
                    </>
                  )}
                </Button>
              </div>

              {state.script && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg"
                >
                  <h3 className="font-semibold mb-2">Generated Script:</h3>
                  <div className="max-h-[400px] overflow-y-auto prose prose-invert">
                    {formatScript(state.script)}
                  </div>
                </motion.div>
              )}

              {state.audioUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg">
                    <audio controls className="w-full">
                      <source src={state.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 hover:bg-gray-800"
                    onClick={() => window.open(state.audioUrl)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Podcast
                  </Button>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-black/90 backdrop-blur-sm border-t border-gray-800 py-6 mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400">
            © 2024 AI Podcast Generator. All rights reserved.
          </p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
};

export default PodcastGeneratorPage;