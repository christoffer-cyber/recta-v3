"use client";
import React from "react";
import { motion } from "framer-motion";

interface Props {
  message?: string;
}

export function LoadingAnimation({ message = "Arbetar..." }: Props) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg my-3">
      {/* Animated Dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      
      <span className="text-sm text-gray-400">{message}</span>
    </div>
  );
}



