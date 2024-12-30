"use client";

import { motion } from "framer-motion";

interface Word {
  text: string;
  className?: string;
}

interface TypewriterEffectProps {
  words: Word[];
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ words }) => {
  return (
    <div className="relative">
      <motion.div className="flex flex-col items-center justify-center">
        <motion.div 
          className="flex flex-col items-center justify-center text-3xl md:text-6xl font-bold"
        >
          <motion.div className="flex flex-wrap items-center justify-center gap-2">
            {words.map((word, idx) => (
              <motion.span
                key={idx}
                className={`${word.className || 'text-white'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: idx * 0.2,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                {word.text}{" "}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};