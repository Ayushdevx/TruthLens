"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  History,
  Trash2,
  Share2,
  Link,
  Flag,
  Tag
} from 'lucide-react';
import { factCheck } from '@/lib/api/geminiApi';

const FakeNewsDetector = () => {
  const [newsText, setNewsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('analyze');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const savedHistory = localStorage.getItem('analysisHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error parsing history:', e);
        localStorage.removeItem('analysisHistory');
      }
    }
  }, []);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [loading]);

  const getResultIcon = (credibility) => {
    const score = Number(credibility) || 0;
    if (score > 80) return <CheckCircle className="text-green-500 h-6 w-6" />;
    if (score > 40) return <Info className="text-yellow-500 h-6 w-6" />;
    return <AlertTriangle className="text-red-500 h-6 w-6" />;
  };

  const handleAnalyze = async () => {
    if (!newsText.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const analysisResult = await factCheck(newsText);
      
      const sanitizedResult = {
        verdict: analysisResult.verdict || 'No verdict available',
        credibility: analysisResult.credibility || 0,
        sources: Array.isArray(analysisResult.sources) ? analysisResult.sources : [],
        explanation: analysisResult.explanation || 'No explanation available',
        categories: Array.isArray(analysisResult.categories) ? analysisResult.categories : [],
        warningFlags: Array.isArray(analysisResult.warningFlags) ? analysisResult.warningFlags : []
      };
      
      const resultItem = {
        id: Date.now(),
        text: newsText,
        result: sanitizedResult,
        timestamp: new Date().toISOString()
      };
      
      setResult(sanitizedResult);
      setHistory(prev => {
        const newHistory = [resultItem, ...prev].slice(0, 10);
        localStorage.setItem('analysisHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (error) {
      console.error('Error analyzing news:', error);
      setError('An error occurred while analyzing the news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('analysisHistory');
  };

  const shareResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(
        `Fake News Analysis Result:\n${newsText}\n\nVERDICT: ${result.verdict}\nCREDIBILITY SCORE: ${result.credibility}%\n\nEXPLANATION: ${result.explanation}`
      );
      alert('Result copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderCategories = (categories = []) => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return null;
    }
    
    return categories.map((category, index) => (
      <Badge key={index} variant="secondary" className="mr-2">
        <Tag className="h-3 w-3 mr-1" />
        {category}
      </Badge>
    ));
  };

  const renderWarningFlags = (flags = []) => {
    if (!Array.isArray(flags) || flags.length === 0) {
      return null;
    }
    
    return flags.map((flag, index) => (
      <Alert key={index} variant="warning" className="mb-2">
        <Flag className="h-4 w-4" />
        <AlertDescription>{flag}</AlertDescription>
      </Alert>
    ));
  };

  return (
    <div className="pt-20 min-h-screen p-8 bg-gradient-to-b from-background to-background/80">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            Fact Check Assistant
          </h1>
          <p className="text-muted-foreground">
            AI-powered news verification and Fact Checker using TruthLens
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste or type the news article here for fact-checking..."
                  value={newsText}
                  onChange={(e) => setNewsText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !newsText.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Verify News'
                  )}
                </Button>

                {loading && (
                  <Progress value={progress} className="w-full" />
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {result && !loading && (
                  <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getResultIcon(result.credibility)}
                        <span className="font-semibold">
                          CREDIBILITY SCORE: {result.credibility}%
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareResult}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Analysis
                      </Button>
                    </div>
                    
                    <div className="bg-card border rounded-lg p-6 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-primary">Fact Check Results</h3>
                        <div className="flex flex-wrap gap-2">
                          {renderCategories(result.categories)}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <h4 className="font-semibold">VERDICT:</h4>
                        </div>
                        <p className="text-sm leading-relaxed">{result.verdict}</p>
                      </div>

                      {result.warningFlags.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Warning Flags</h4>
                          {renderWarningFlags(result.warningFlags)}
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Link className="h-4 w-4" />
                          VERIFIED SOURCES:
                        </h4>
                        <ul className="space-y-2">
                          {(result.sources || []).map((source, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span className="text-muted-foreground">{source}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-accent/20 rounded-md p-4">
                        <h4 className="font-semibold mb-2">DETAILED ANALYSIS:</h4>
                        <p className="text-sm text-muted-foreground">
                          {result.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Analysis History</h3>
                {history.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                )}
              </div>
              
              {history.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No analysis history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <Card
                      key={item.id}
                      className="p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2">
                            {getResultIcon(item.result?.credibility)}
                            <span className="text-sm font-medium">
                              Credibility: {item.result?.credibility || 0}%
                            </span>
                          </div>
                        </div>
                        <p className="line-clamp-2 text-sm">{item.text}</p>
                        <p className="text-sm font-medium text-primary">
                          {item.result?.verdict || 'No verdict available'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {renderCategories(item.result?.categories)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FakeNewsDetector;