// hooks/useNews.ts
import { useState, useEffect } from 'react';
import { NewsArticle, fetchNews } from '@/lib/api/newsApi';

export function useNews(initialCategory: string = 'general') {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNews = async (reset: boolean = false) => {
    if (loading || (!nextPage && !reset)) return;
    
    setLoading(true);
    setError('');

    try {
      const data = await fetchNews(
        category, 
        reset ? null : nextPage
      );
      
      if (!data || !data.results) {
        throw new Error('Invalid response from news API');
      }

      if (reset) {
        setNews(data.results);
      } else {
        setNews(prev => [...prev, ...data.results]);
      }
      
      setNextPage(data.nextPage);
    } catch (error) {
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNews([]);
    setNextPage(null);
    loadNews(true);
  }, [category]);

  return {
    news,
    loading,
    error,
    hasMore: !!nextPage,
    category,
    setCategory,
    loadMore: () => loadNews(false),
  };
}