"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Adjust import according to your utility function location

export default function AboutPage() {
  // States and Refs for the TextRevealCard
  const [widthPercentage, setWidthPercentage] = useState(0);
  const [leftPosition, setLeftPosition] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Effect hook to capture the card's position and dimensions
  useEffect(() => {
    const setPositionData = () => {
      if (cardRef.current) {
        const { left, width } = cardRef.current.getBoundingClientRect();
        setLeftPosition(left);
        setCardWidth(width);
      }
    };
    window.addEventListener('resize', setPositionData);
    setPositionData(); // Call on initial render
    return () => window.removeEventListener('resize', setPositionData);
  }, []);

  // Mouse event handlers for the TextRevealCard
  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientX } = event;
    if (cardRef.current) {
      const relativeX = clientX - leftPosition;
      setWidthPercentage(Math.max(0, Math.min((relativeX / cardWidth) * 100, 100)));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setWidthPercentage(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const rotateDegree = (widthPercentage - 50) * 0.2; // Increased rotation effect

  return (
    <div className="min-h-screen pt-20 px-4 bg-black text-white">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">About TruthLens</h1>

        <div className="prose prose-lg dark:prose-invert mb-10">
          <p className="text-xl mb-6">
            TruthLens is your trusted platform for verified news and content, harnessing cutting-edge AI technology combined with human expertise to empower informed decision-making.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p>
            In an era of information overload, our mission is to provide readers with reliable, fact-checked news while promoting media literacy and critical thinking skills.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">What We Do</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Aggregate news from trusted sources worldwide to deliver diverse perspectives.</li>
            <li>Employ advanced AI-powered fact-checking systems for accuracy and reliability.</li>
            <li>Provide real-time news verification to combat misinformation swiftly.</li>
            <li>Offer educational resources designed to enhance media literacy among readers.</li>
            <li>Foster a vibrant community of informed readers who engage in critical discourse.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Technology</h2>
          <p>
            Our state-of-the-art technology employs advanced AI algorithms and machine learning models to analyze news content, check facts, and detect potential misinformation. Our system evaluates multiple factors including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Source credibility based on reputation and history.</li>
            <li>Content authenticity through sophisticated validation processes.</li>
            <li>Cross-reference verification to ensure consistency across sources.</li>
            <li>Historical fact-checking to trace the reliability of information.</li>
            <li>Contextual analysis to provide clarity and depth to the news.</li>
          </ul>
        </div>

        {/* Developer Section */}
        <div className="text-center mb-10">
          <img 
            src="https://media.licdn.com/dms/image/v2/D5603AQFgVZrPnKX2yg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1714299394862?e=1740614400&v=beta&t=HE1P9p2YdSKJsubHvqIVmdkGI4bfL1nLu6Qg6ZPvrkI"
            alt="Ayush Upadhyay" 
            className="rounded-full w-24 h-24 mx-auto mb-4 border border-white"
          />
          <h3 className="text-xl font-semibold">Ayush Upadhyay</h3>
          <p className="text-gray-400">Developer</p>
        </div>

        {/* Text Reveal Card */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          ref={cardRef}
          className={cn("bg-black border border-gray-800 w-full sm:w-[40rem] rounded-lg p-8 relative overflow-hidden mx-auto")}
        >
          <div className="h-40 relative flex items-center overflow-hidden">
            {/* Revealing Text with black theme */}
            <motion.div
              style={{ width: "100%" }}
              animate={
                isHovered
                  ? {
                      opacity: widthPercentage > 0 ? 1 : 0,
                      clipPath: `inset(0 ${100 - widthPercentage}% 0 0)`,
                      transition: { duration: 0.4 }
                    }
                  : {
                      clipPath: `inset(0 ${100 - widthPercentage}% 0 0)`,
                      transition: { duration: 0.4 }
                    }
              }
              className="absolute bg-black z-20 will-change-transform"
            >
              <p className="text-base sm:text-4xl py-10 font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-b from-gray-400 to-gray-600">
                By Ayush Upadhyay
              </p>
            </motion.div>

            {/* Rotating Indicator */}
            <motion.div
              animate={{
                left: `${widthPercentage}%`,
                rotate: `${rotateDegree}deg`,
                opacity: widthPercentage > 0 ? 1 : 0,
              }}
              transition={isHovered ? { duration: 0 } : { duration: 0.4 }}
              className="h-40 w-[4px] bg-gradient-to-b from-transparent via-gray-800 to-transparent absolute z-50 will-change-transform"
            ></motion.div>

            {/* Background Text for Reveal */}
            <div className="overflow-hidden [mask-image:linear-gradient(to-bottom, transparent, white, transparent)] h-full">
              <p className="text-base sm:text-4xl py-10 font-extrabold bg-clip-text text-transparent bg-[#323238]">
                Made with love and integrity.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}