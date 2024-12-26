"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Play, Download } from 'lucide-react';
import { WavyBackground } from '@/components/ui/wavy-background';  // Ensure this is the correct path

const GEMINI_API_KEY = 'AIzaSyCCYguhAkip0xMgN1074yYTYpn2SfLcL10';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export default function PodcastGeneratorPage() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await file.text();
      setContent(text);
    }
  };

  const handleGenerate = async () => {
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GEMINI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: content, // Use your desired prompt structure
          maxTokens: 300, // Adjust as needed based on Gemini's capabilities
        }),
      });

      const data = await response.json();
      // Update audioUrl based on the response from Gemini API
      setAudioUrl(data.audioUrl || '/sample-podcast.mp3');  // Replace with actual audio URL from response
    } catch (error) {
      console.error('Error generating podcast:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <WavyBackground />
      <div className="absolute inset-0 z-10 flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full mx-auto px-4"
        >
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            Podcast Generator
          </h1>

          <Card className="p-6 bg-black text-white shadow-md">
            <div className="space-y-6">
              <div>
                <Input
                  placeholder="Podcast Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mb-4 bg-gray-800 text-white"
                />

                <Textarea
                  placeholder="Enter your content or upload a file..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] bg-gray-800 text-white"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload').click()}
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
                  disabled={loading || !content.trim()}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Podcast
                    </>
                  )}
                </Button>
              </div>

              {audioUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <audio controls className="w-full mb-4">
                    <source src={audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>

                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Podcast
                  </Button>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}