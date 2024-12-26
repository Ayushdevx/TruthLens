// app/news/page.tsx
"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNews } from '@/hooks/useNews';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Clock,
  ExternalLink,
  Globe,
  History,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { NewsArticle } from '@/lib/api/newsApi';
import {
  saveBookmark,
  removeBookmark,
  isBookmarked,
  saveToReadingHistory,
  getBookmarks,
  getReadingHistory,
} from '@/app/utils/newsUtils';

const categories = [
  'general',
  'business',
  'technology',
  'entertainment',
  'sports',
  'science',
  'health',
];

export default function NewsPage() {
  const {
    news,
    loading,
    error,
    hasMore,
    category,
    setCategory,
    loadMore,
  } = useNews();

  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<NewsArticle[]>([]);
  const [readingHistory, setReadingHistory] = useState<NewsArticle[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    setBookmarkedArticles(getBookmarks());
    setReadingHistory(getReadingHistory());
  }, []);

  const filteredNews = news.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedArticles = showBookmarks ? bookmarkedArticles :
    showHistory ? readingHistory : filteredNews;

  const observer = useRef<IntersectionObserver>();
  const lastNewsElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleShare = async (article: NewsArticle) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.link,
        });
      } else {
        await navigator.clipboard.writeText(article.link);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share article');
    }
  };

  const handleBookmark = (article: NewsArticle) => {
    if (isBookmarked(article.article_id)) {
      removeBookmark(article.article_id);
      setBookmarkedArticles(prev => prev.filter(a => a.article_id !== article.article_id));
      toast.success('Removed from bookmarks');
    } else {
      saveBookmark(article);
      setBookmarkedArticles(prev => [...prev, article]);
      toast.success('Added to bookmarks');
    }
  };

  const handleReadMore = (article: NewsArticle) => {
    saveToReadingHistory(article);
    setReadingHistory(prev => [article, ...prev.filter(a => a.article_id !== article.article_id)]);
    window.open(article.link, '_blank');
  };

  return (
    <div className="min-h-screen px-4 pt-16 bg-gradient-to-b from-background to-secondary/20"> {/* Added pt-16 to provide top space */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Latest News
          </h1>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button
              variant={showBookmarks ? "default" : "outline"}
              onClick={() => {
                setShowBookmarks(!showBookmarks);
                setShowHistory(false);
              }}
              className="gap-2"
            >
              <Bookmark className="h-4 w-4" />
              Bookmarks
            </Button>
            <Button
              variant={showHistory ? "default" : "outline"}
              onClick={() => {
                setShowHistory(!showHistory);
                setShowBookmarks(false);
              }}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              History
            </Button>
          </div>
        </div>

        {!showBookmarks && !showHistory && (
          <Tabs value={category} className="mb-8">
            <TabsList className="flex flex-wrap gap-2 p-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  onClick={() => setCategory(cat)}
                  className="capitalize"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <div className="mb-8">
          <Input
            type="search"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 mb-4 p-4 bg-red-50 rounded-lg flex items-center"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedArticles.map((article, index) => (
              <motion.div
                key={article.article_id || `${article.title}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                ref={index === displayedArticles.length - 1 ? lastNewsElementRef : null}
                layoutId={article.article_id}
                onClick={() => setActiveArticle(article)}
                className="cursor-pointer"
              >
                <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  {article.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      {format(new Date(article.pubDate), 'MMM dd, yyyy')}
                      {article.source_id && (
                        <>
                          <span className="mx-1">•</span>
                          <Globe className="h-4 w-4" />
                          <span>{article.source_id}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold line-clamp-2 hover:line-clamp-none transition-all duration-300">
                      {article.title}
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {article.description}
                    </p>
                    {article.keywords && article.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {article.keywords.slice(0, 3).map((keyword, i) => (
                          <span
                            key={i}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between items-center mt-auto pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadMore(article);
                      }}
                      className="gap-2"
                    >
                      Read More
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookmark(article);
                        }}
                      >
                        {isBookmarked(article.article_id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(article);
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-card rounded-lg overflow-hidden"
              >
                <div className="h-48 bg-muted" />
                <div className="p-4">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && displayedArticles.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">
                {showBookmarks ? "No bookmarked articles yet" :
                 showHistory ? "No reading history yet" :
                 "No news articles found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {showBookmarks ? "Articles you bookmark will appear here" :
                 showHistory ? "Articles you read will appear here" :
                 "Try adjusting your search or changing categories"}
              </p>
              {(showBookmarks || showHistory) && (
                <Button
                  onClick={() => {
                    setShowBookmarks(false);
                    setShowHistory(false);
                  }}
                >
                  Browse News
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Article Modal */}
        <AnimatePresence>
          {activeArticle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActiveArticle(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {activeArticle.image_url && (
                  <img
                    src={activeArticle.image_url}
                    alt={activeArticle.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="h-4 w-4" />
                    {format(new Date(activeArticle.pubDate), 'PPP')}
                    {activeArticle.source_id && (
                      <>
                        <span className="mx-1">•</span>
                        <Globe className="h-4 w-4" />
                        <span>{activeArticle.source_id}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{activeArticle.title}</h2>
                  <p className="text-muted-foreground mb-6">{activeArticle.description}</p>
                  {activeArticle.content && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Full Content</h3>
                      <p>{activeArticle.content}</p>
                    </div>
                  )}
                  {activeArticle.keywords && activeArticle.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {activeArticle.keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={() => handleReadMore(activeArticle)}
                      className="gap-2"
                    >
                      Read Full Article
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleBookmark(activeArticle)}
                      >
                        {isBookmarked(activeArticle.article_id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare(activeArticle)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}