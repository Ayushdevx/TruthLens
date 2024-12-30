"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Globe, TrendingUp, Leaf } from 'lucide-react';
import Link from 'next/link';
import { WorldMap } from '@/components/ui/world-map'; // Adjust as needed
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'; // Adjust as needed
import { Lens } from '@/components/ui/lens'; // Adjust as needed
import { useState } from 'react';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Sample data for routes and categories (adjust as necessary)
  const routes = [
    {
      start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
      end: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
    },
    {
      start: { lat: 64.2008, lng: -149.4937 }, // Alaska
      end: { lat: -15.7975, lng: -47.8919 }, // Brazil
    },
    {
      start: { lat: -15.7975, lng: -47.8919 }, // Brazil
      end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
    },
    {
      start: { lat: 51.5074, lng: -0.1278 }, // London
      end: { lat: 28.6139, lng: 77.209 }, // New Delhi
    },
    {
      start: { lat: 28.6139, lng: 77.209 }, // New Delhi
      end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
    },
    {
      start: { lat: 28.6139, lng: 77.209 }, // New Delhi
      end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
    },
    {
      start: { lat: 26.8467, lng: 80.9462 }, // Lucknow
      end: { lat: 13.0674, lng: 80.2376 }, // Chennai
    },
  ];

  const categories = [
    { id: 1, title: "Global Headlines", icon: <Globe className="w-6 h-6" />, description: "Breaking news and updates from around the world" },
    { id: 2, title: "Tech Innovation", icon: <Sparkles className="w-6 h-6" />, description: "Latest in technology and AI advancements" },
    { id: 3, title: "Market Insights", icon: <TrendingUp className="w-6 h-6" />, description: "Financial markets and economic analysis" },
    { id: 4, title: "Climate Action", icon: <Leaf className="w-6 h-6" />, description: "Environmental news and sustainability" }
  ];

  const newsItems = [
    { title: "Global Headlines", content: "Stay informed with the latest breaking news.", category: "World", link: "/global-headlines" },
    { title: "Tech Innovation", content: "Explore amazing innovations in AI.", category: "Technology", link: "/tech-innovation" },
    { title: "Market Watch", content: "Get crucial insights into financial markets.", category: "Finance", link: "/market-watch" },
    { title: "Climate Action", content: "Discover urgent updates around climate change.", category: "Environment", link: "/climate-action" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center bg-black">
        <div className="absolute inset-0 z-0">
          <Lens lensSize={300} zoomFactor={1.8}>
            <WorldMap dots={routes} lineColor="#3b82f6" className="w-full h-full opacity-70" />
          </Lens>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 shadow-md" // Adding a shadow for readability
          >
            Discover Truth in News
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8"
          >
            Your trusted platform for verified news, real-time updates, and AI-powered fact-checking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/news">
              <Button variant="default" size="lg" className="bg-white text-black hover:bg-gray-200 z-10">
                Browse News
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/blog">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10 z-10">
                Read Blog Posts
                <span className="ml-2">→</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-black py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white text-center mb-12"
          >
            Featured Categories
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 * category.id }} 
                className="relative p-6 rounded-lg cursor-pointer bg-white bg-opacity-10 backdrop-blur-lg border border-gray-300 border-opacity-20 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105"
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.05, rotate: 2, transition: { duration: 0.3 } }}
              >
                <div className="flex items-center mb-2">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{category.title}</h3>
                <p className="text-gray-400">{category.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Moving Cards Section */}
      <section className="bg-black py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Explore Latest Headlines With Truth Lens
          </h2>
          <InfiniteMovingCards
            items={newsItems}
            direction="right"
            speed="slow"
          >
            {(item) => (
              <div className="w-[350px] h-[200px] p-6 mx-2 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.content}</p>
                <span className="inline-block mt-4 text-blue-400">{item.category}</span>
              </div>
            )}
          </InfiniteMovingCards>
        </div>
      </section>
    </div>
  );
}