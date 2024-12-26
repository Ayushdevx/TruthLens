import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";
import Image from "next/image";
import { useTheme } from "next-themes";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
  className?: string;
}

export function WorldMap({
  dots = [],
  lineColor = "#3b82f6", // Default color for light mode
  className = "",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    // Retrieve the theme from local storage if available
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    }
    // Hide the loading state after the theme is determined
    setLoading(false);
  }, [setTheme]);

  const map = new DottedMap({
    height: 100,
    grid: "diagonal",
  });

  const svgMap = map.getSVG({
    radius: 0.2,
    color: theme === "dark" ? "#FFFFFF40" : "#00000020",
    shape: "circle",
    backgroundColor: "transparent",
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50; // Control curve height
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  if (loading) {
    return <div className="h-full w-full flex items-center justify-center bg-gray-300 dark:bg-gray-800">Loading...</div>; // Simple loading state
  }

  return (
    <div className={`${className} rounded-lg relative font-sans overflow-hidden`}>
      <div className={`absolute inset-0 ${theme === "dark" ? "bg-black/80" : "bg-white/40"} backdrop-blur-3xl transition-colors duration-300`} />
      
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        alt="world map"
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none transition-opacity duration-300"
        height={495}
        width={1056}
        priority
        draggable={false}
      />

      <svg ref={svgRef} viewBox="0 0 800 400" className="absolute inset-0 w-full h-full pointer-events-none select-none">
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme === "dark" ? "rgba(255, 255, 255, 0)" : "rgba(0, 0, 0, 0)"} />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor={theme === "dark" ? "rgba(255, 255, 255, 0)" : "rgba(0, 0, 0, 0)"} />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              {/* Curved path */}
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.2 * i,
                  ease: "easeOut",
                }}
              />
              
              {/* Animated starting dot */}
              <motion.circle
                cx={startPoint.x}
                cy={startPoint.y}
                r="4"
                fill={theme === "dark" ? "#FF8C00" : lineColor}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 * i }}
              >
                <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
              </motion.circle>
              
              {/* Animated ending dot */}
              <motion.circle
                cx={endPoint.x}
                cy={endPoint.y}
                r="4"
                fill={theme === "dark" ? "#FF8C00" : lineColor}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 * i + 1 }}
              >
                <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
              </motion.circle>
              
              {/* Tooltip for starting point */}
              {dot.start.label && (
                <motion.text 
                  x={startPoint.x} 
                  y={startPoint.y - 10} 
                  fill={theme === "dark" ? "white" : "black"} 
                  fontSize="10" 
                  textAnchor="middle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {dot.start.label}
                </motion.text>
              )}
              {/* Tooltip for ending point */}
              {dot.end.label && (
                <motion.text 
                  x={endPoint.x} 
                  y={endPoint.y - 10} 
                  fill={theme === "dark" ? "white" : "black"} 
                  fontSize="10" 
                  textAnchor="middle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {dot.end.label}
                </motion.text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}