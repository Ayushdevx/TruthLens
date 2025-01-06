// lib/api/geminiApi.ts

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
}

interface AnalysisResult {
  verdict: string;
  credibility: number;
  sources: string[];
  explanation: string;
  categories: string[];
  warningFlags: string[];
}

const GEMINI_API_KEY = 'AIzaSyB3YyfnTUGdN6uVrT3rdx4tfHp7IBe4tj0';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function generateResponse(prompt: string): Promise<GeminiResponse> {
  if (!GEMINI_API_KEY) {
    throw new APIError(500, 'Gemini API key is not configured');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt,
            }],
          }],
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        errorData.error?.message || `API request failed: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, `Failed to generate response: ${error.message}`);
  }
}

export async function factCheck(text: string): Promise<AnalysisResult> {
  const prompt = `
You are a professional fact-checker and journalist. Analyze the following news article for factual accuracy and credibility. 
Provide your analysis in the following structured format, maintaining these exact section headers:

**VERDICT:**  
[Provide a clear, detailed statement (2-3 sentences) on whether the information is true, false, or needs more context]

**CREDIBILITY SCORE:**  
[Provide a numerical score from 0-100, followed by a brief justification]

**TRUSTED SOURCES:**  
- [List 3-5 specific, authoritative sources that verify or refute the claims]

**DETAILED ANALYSIS:**  
[Provide a thorough, multi-paragraph analysis of the claims, evidence, and context]

**CATEGORIES:**  
- [List 2-4 relevant categories like Politics, Health, Science, Technology, etc.]

**WARNING FLAGS:**  
- [List specific warning signs or concerns, if any]

News text to analyze:  
"${text}"

Remember to be specific, cite evidence where possible, and maintain professional objectivity in your analysis.
`;

  try {
    const response = await generateResponse(prompt);
    
    if (!response.candidates || response.candidates.length === 0) {
      throw new APIError(500, 'No response generated from API');
    }

    const rawAnalysis = response.candidates[0].content.parts[0].text;
    return parseAnalysisResponse(rawAnalysis);
  } catch (error) {
    console.error('Fact check error:', error);
    throw error;
  }
}

function parseAnalysisResponse(rawText: string): AnalysisResult {
  const defaultResult: AnalysisResult = {
    verdict: 'Analysis unavailable',
    credibility: 0,
    sources: [],
    explanation: 'No analysis available',
    categories: [],
    warningFlags: [],
  };

  try {
    const sections = rawText.split('\n\n');
    let result = { ...defaultResult };

    for (let section of sections) {
      section = section.trim();
      
      // Parse Verdict
      if (section.startsWith('VERDICT:')) {
        result.verdict = section.replace('VERDICT:', '').trim();
      } 
      // Parse Credibility Score
      else if (section.startsWith('CREDIBILITY SCORE:')) {
        const scoreText = section.replace('CREDIBILITY SCORE:', '').trim();
        const scoreMatch = scoreText.match(/\d+/);
        if (scoreMatch) {
          result.credibility = Math.min(100, Math.max(0, parseInt(scoreMatch[0])));
        }
      }
      // Parse Sources
      else if (section.startsWith('TRUSTED SOURCES:')) {
        result.sources = section
          .replace('TRUSTED SOURCES:', '')
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace('-', '').trim())
          .filter(Boolean);
      }
      // Parse Detailed Analysis
      else if (section.startsWith('DETAILED ANALYSIS:')) {
        result.explanation = section.replace('DETAILED ANALYSIS:', '').trim();
      }
      // Parse Categories
      else if (section.startsWith('CATEGORIES:')) {
        result.categories = section
          .replace('CATEGORIES:', '')
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace('-', '').trim())
          .filter(Boolean);
      }
      // Parse Warning Flags
      else if (section.startsWith('WARNING FLAGS:')) {
        result.warningFlags = section
          .replace('WARNING FLAGS:', '')
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace('-', '').trim())
          .filter(Boolean);
      }
    }

    // Validate and ensure minimum content
    if (!result.verdict || result.verdict === 'Analysis unavailable') {
      const content = rawText.slice(0, 200).trim();
      result.verdict = content ? content : defaultResult.verdict;
    }

    if (!result.sources.length) {
      result.sources = ['No specific sources cited'];
    }

    if (!result.categories.length) {
      result.categories = ['Uncategorized'];
    }

    return result;
  } catch (error) {
    console.error('Error parsing analysis response:', error);
    console.log('Raw response:', rawText);
    return defaultResult;
  }
}