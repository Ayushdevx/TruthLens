// app/utils/newsUtils.ts

import { NewsArticle } from '@/lib/api/newsApi';

const BOOKMARKS_KEY = 'news_bookmarks';
const READING_HISTORY_KEY = 'news_reading_history';

// Get all bookmarked articles
export const getBookmarks = (): NewsArticle[] => {
  if (typeof window === 'undefined') return [];
  try {
    const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
    return bookmarks ? JSON.parse(bookmarks) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

// Save a new bookmark
export const saveBookmark = (article: NewsArticle): void => {
  try {
    const bookmarks = getBookmarks();
    const updatedBookmarks = [article, ...bookmarks.filter(b => b.article_id !== article.article_id)];
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
  } catch (error) {
    console.error('Error saving bookmark:', error);
  }
};

// Remove a bookmark
export const removeBookmark = (articleId: string): void => {
  try {
    const bookmarks = getBookmarks();
    const updatedBookmarks = bookmarks.filter(b => b.article_id !== articleId);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
  } catch (error) {
    console.error('Error removing bookmark:', error);
  }
};

// Check if an article is bookmarked
export const isBookmarked = (articleId: string): boolean => {
  try {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.article_id === articleId);
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return false;
  }
};

// Get reading history
export const getReadingHistory = (): NewsArticle[] => {
  if (typeof window === 'undefined') return [];
  try {
    const history = localStorage.getItem(READING_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting reading history:', error);
    return [];
  }
};

// Save to reading history
export const saveToReadingHistory = (article: NewsArticle): void => {
  try {
    const history = getReadingHistory();
    const updatedHistory = [article, ...history.filter(h => h.article_id !== article.article_id)].slice(0, 50); // Keep last 50 articles
    localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving to reading history:', error);
  }
};

// Clear reading history
export const clearReadingHistory = (): void => {
  try {
    localStorage.removeItem(READING_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing reading history:', error);
  }
};