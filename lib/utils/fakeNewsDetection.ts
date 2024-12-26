interface ArticleMetrics {
  sourceCredibility: number;
  contentQuality: number;
  factualConsistency: number;
  overallScore: number;
}

export function analyzeArticle(content: string, source: string): ArticleMetrics {
  // Source credibility check
  const sourceCredibility = checkSourceCredibility(source);
  
  // Content quality analysis
  const contentQuality = analyzeContentQuality(content);
  
  // Factual consistency check
  const factualConsistency = checkFactualConsistency(content);
  
  // Calculate overall score
  const overallScore = calculateOverallScore(sourceCredibility, contentQuality, factualConsistency);
  
  return {
    sourceCredibility,
    contentQuality,
    factualConsistency,
    overallScore
  };
}

function checkSourceCredibility(source: string): number {
  // List of credible news sources
  const credibleSources = [
    'reuters.com',
    'apnews.com',
    'bbc.com',
    'bloomberg.com',
    'nytimes.com',
    'wsj.com'
  ];
  
  // Check if source is in credible sources list
  const domain = extractDomain(source);
  if (credibleSources.includes(domain)) {
    return 1.0;
  }
  
  // Additional checks can be implemented here
  return 0.7;
}

function analyzeContentQuality(content: string): number {
  let score = 1.0;
  
  // Check for clickbait patterns
  const clickbaitPatterns = [
    /you won't believe/i,
    /shocking/i,
    /mind-blowing/i,
    /incredible/i,
    /amazing/i
  ];
  
  clickbaitPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      score -= 0.1;
    }
  });
  
  // Check for emotional language
  const emotionalPatterns = [
    /outrage/i,
    /scandal/i,
    /controversial/i,
    /viral/i
  ];
  
  emotionalPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      score -= 0.1;
    }
  });
  
  return Math.max(score, 0);
}

function checkFactualConsistency(content: string): number {
  let score = 1.0;
  
  // Check for fact patterns
  const factPatterns = [
    /according to/i,
    /research shows/i,
    /studies indicate/i,
    /experts say/i
  ];
  
  let factualReferences = 0;
  factPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      factualReferences++;
    }
  });
  
  // Adjust score based on factual references
  if (factualReferences === 0) {
    score -= 0.3;
  }
  
  return Math.max(score, 0);
}

function calculateOverallScore(
  sourceCredibility: number,
  contentQuality: number,
  factualConsistency: number
): number {
  // Weighted average
  const weights = {
    sourceCredibility: 0.4,
    contentQuality: 0.3,
    factualConsistency: 0.3
  };
  
  const score = (
    sourceCredibility * weights.sourceCredibility +
    contentQuality * weights.contentQuality +
    factualConsistency * weights.factualConsistency
  );
  
  return Math.round(score * 100) / 100;
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return domain.startsWith('www.') ? domain.slice(4) : domain;
  } catch {
    return url.toLowerCase();
  }
}