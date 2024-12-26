// lib/api/newsApi.ts
const API_KEY = 'pub_63343571e16386fa11ca368111b34708d37f3';
const BASE_URL = 'https://newsdata.io/api/1';

export interface NewsArticle {
  article_id: string;
  title: string;
  link: string;
  keywords: string[];
  creator: string[];
  video_url: string | null;
  description: string;
  content: string;
  pubDate: string;
  image_url: string | null;
  source_id: string;
  source_priority: number;
  country: string[];
  category: string[];
  language: string;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  results: NewsArticle[];
  nextPage: string | null;
}

export async function fetchNews(
  category: string = 'top',
  page: string | null = null,
  language: string = 'en'
): Promise<NewsResponse> {
  try {
    let url = `${BASE_URL}/news?apikey=${API_KEY}&language=${language}`;
    
    if (category !== 'general') {
      url += `&category=${category}`;
    }
    
    if (page) {
      url += `&page=${page}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('News API request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}