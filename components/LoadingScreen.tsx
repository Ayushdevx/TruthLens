"use client";

import React, { useState } from 'react';
import { Atom, Boxes, Sparkles } from 'lucide-react';

interface MousePosition {
  x: number;
  y: number;
}

const LoadingScreen: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 overflow-hidden"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic 3D background grid */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
            style={{
              top: `${i * 5}%`,
              transform: `translateZ(${-100 + i * 10}px) rotateX(${mousePosition.y * 10}deg)`,
              transformStyle: "preserve-3d"
            }}
          />
        ))}
        {[...Array(20)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full w-px bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"
            style={{
              left: `${i * 5}%`,
              transform: `translateZ(${-100 + i * 10}px) rotateY(${mousePosition.x * 10}deg)`,
              transformStyle: "preserve-3d"
            }}
          />
        ))}
      </div>

      {/* Main loader container */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
          transformStyle: "preserve-3d"
        }}
      >
        <div className="relative w-64 h-64">
          {/* Orbital rings */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`ring-${i}`}
              className="absolute inset-0 border-2 rounded-full"
              style={{
                borderColor: `rgba(${56 + i * 50}, ${189 - i * 30}, ${248 - i * 40}, 0.5)`,
                transform: `rotateX(${60 + i * 30}deg) rotateY(${i * 45}deg)`,
                animation: `spin${i} ${4 + i * 2}s linear infinite`,
                transformStyle: "preserve-3d"
              }}
            />
          ))}

          {/* Core sphere */}
          <div className="absolute inset-0 m-auto w-32 h-32">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600/80 to-purple-600/80 shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 animate-ping" />
          </div>

          {/* Rotating icons */}
          <div className="absolute inset-0">
            {[Atom, Boxes, Sparkles].map((Icon, i) => (
              <div
                key={`icon-${i}`}
                className="absolute w-8 h-8 text-white"
                style={{
                  left: `${50 + Math.cos(i * (Math.PI * 2 / 3)) * 40}%`,
                  top: `${50 + Math.sin(i * (Math.PI * 2 / 3)) * 40}%`,
                  animation: `orbit ${3 + i}s linear infinite`,
                  transformStyle: "preserve-3d"
                }}
              >
                <Icon className="w-full h-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading text */}
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <div className="inline-block">
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text">
            Loading Experience
          </span>
          <div className="mt-2 flex justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={`dot-${i}`}
                className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin0 {
          to { transform: rotateX(60deg) rotateY(360deg); }
        }
        @keyframes spin1 {
          to { transform: rotateX(90deg) rotateY(-360deg); }
        }
        @keyframes spin2 {
          to { transform: rotateX(120deg) rotateY(360deg); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;