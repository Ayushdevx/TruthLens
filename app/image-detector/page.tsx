"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import Background3D from '@/components/Background3D';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || AIzaSyB3YyfnTUGdN6uVrT3rdx4tfHp7IBe4tj0';
// Updated to use Gemini 1.5 endpoint
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

interface AnalysisResult {
  isAI: boolean;
  confidence: number;
  details: string;
  features: string[];
}

export default function ImageDetectorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Check file size (max 4MB)
      if (selectedFile.size > 4 * 1024 * 1024) {
        setError('Please upload an image smaller than 4MB');
        return;
      }
      
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      setResult(null);
      setError(null);
    }
  };

  const getImageAsBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const analyzeWithGemini = async (imageBase64: string) => {
    try {
      const prompt = `You are an AI image analysis expert. Analyze this image and determine if it's AI-generated or authentic. Focus on:
      - Lighting and shadow consistency
      - Texture patterns and irregularities
      - Fine details in faces, hands, and complex structures
      - Perspective and proportion accuracy
      - Background consistency and transitions
      
      Return your analysis in this JSON format (important: return ONLY valid JSON, no other text):
      {
        "isAI": boolean indicating if AI-generated,
        "confidence": number between 0-100,
        "details": "main analysis findings",
        "features": ["list", "of", "specific", "observations"]
      }`;

      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { 
                mime_type: "image/jpeg", 
                data: imageBase64.split(',')[1] 
              } 
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Details:', errorData);
        
        if (errorData.error?.message) {
          throw new Error(errorData.error.message);
        } else {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid API response structure');
      }

      const resultText = data.candidates[0].content.parts[0].text;
      try {
        // Attempt to parse the entire response as JSON first
        const result = JSON.parse(resultText);
        return result;
      } catch {
        // If that fails, try to extract JSON from the text
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in response');
        }
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
      }
      throw error;
    }
  };

  const analyzeFile = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting image analysis...');
      const imageBase64 = await getImageAsBase64(file);
      console.log('Image converted to base64');
      
      const analysisResult = await analyzeWithGemini(imageBase64);
      console.log('Analysis complete:', analysisResult);
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Analysis failed. Please try again with a different image.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Background3D />
      <div className="min-h-screen pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            AI Image Detector
          </h1>

          <Card className="p-6 backdrop-blur-lg bg-background/80">
            <div className="space-y-6">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-48 object-contain mb-4" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Supported formats: PNG, JPG, JPEG (max 4MB)
                        </p>
                      </>
                    )}
                  </div>
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {error && (
                <div className="text-red-500 text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              <Button
                onClick={analyzeFile}
                disabled={!file || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Analyze Image
                  </>
                )}
              </Button>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Analysis Result</h3>
                    <div className={`flex items-center ${
                      result.isAI ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {result.isAI ? (
                        <>
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          AI Generated
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-5 w-5 mr-2" />
                          Likely Authentic
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence Level</span>
                      <span>{result.confidence.toFixed(1)}%</span>
                    </div>
                    <Progress value={result.confidence} />
                  </div>

                  <div className="bg-accent/20 p-4 rounded-lg space-y-4">
                    <p className="text-sm text-muted-foreground">{result.details}</p>
                    
                    {result.features && result.features.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Key Observations:</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {result.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
}