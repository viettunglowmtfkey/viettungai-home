import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

// --- Constants ---
const VIDEO_URL = "https://pikaso.cdnpk.net/private/production/4042839424/c6e6e723-a49d-442b-ae4a-38f9f3f7f8ae-0.mp4?token=exp=1777075200~hmac=2b489b0e1e84150a47885ac27d7641396eb7b137642b0a5e45c8be2724fc8599";

const LOGOS = [
  { name: "TryOn AI", letter: "T" },
  { name: "Prompt Generator", letter: "P" },
  { name: "Packing List", letter: "L" },
  { name: "Content Writer", letter: "C" },
  { name: "Image Generator", letter: "I" },
  { name: "Tracking Tool", letter: "T" },
];

const HeroVideo = () => {
  return (
    <video
      src={VIDEO_URL}
      autoPlay
      muted
      playsInline
      loop
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
};

const Navbar = () => {
  return (
    <nav className="w-full py-5 px-8 flex flex-row justify-between items-center relative z-50">
      <div className="flex items-center gap-3">
        {/* Logo placeholder - styling it to look premium */}
        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center overflow-hidden shadow-lg border border-white/20">
          <div className="w-full h-full bg-gradient-to-br from-indigo-400 via-indigo-600 to-amber-400 opacity-80" />
          <span className="absolute text-white font-bold text-lg select-none">V</span>
        </div>
        <span className="font-display font-semibold text-xl tracking-tight text-foreground/95">VietTung</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {["AI Tools", "Operations", "Content", "System"].map((item) => (
          <button
            key={item}
            className="text-foreground/90 hover:text-foreground transition-colors font-medium text-sm"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-full px-4 py-2 liquid-glass text-sm font-medium hover:bg-white/5 transition-colors border border-white/5 cursor-pointer">
          Open Dashboard
        </button>
      </div>

      {/* Navbar Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent translate-y-[3px]" />
    </nav>
  );
};

const LogoMarquee = () => {
  return (
    <div className="w-full pb-10 mt-auto relative z-20 px-8">
      <div className="max-w-5xl mx-auto flex items-center gap-12">
        <div className="text-foreground/50 text-sm leading-tight flex-shrink-0 whitespace-nowrap">
          Core tools used across <br /> the VietTung AI system
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <motion.div 
            className="flex gap-16 items-center whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: 20, 
              ease: "linear", 
              repeat: Infinity 
            }}
          >
            {[...LOGOS, ...LOGOS].map((logo, idx) => (
              <div key={idx} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg liquid-glass flex items-center justify-center text-xs font-bold border border-white/5 shadow-lg group-hover:scale-110 transition-transform">
                  {logo.letter}
                </div>
                <span className="text-base font-semibold text-foreground/70 group-hover:text-foreground transition-colors">
                  {logo.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen bg-background relative flex flex-col overflow-hidden text-foreground selection:bg-white/20 selection:text-white">
      {/* Background Video Wrapper */}
      <div className="absolute inset-0 z-0 bg-background overflow-hidden">
        <HeroVideo />
      </div>

      {/* Blurred Overlay Shape */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] opacity-90 bg-gray-950 blur-[82px] pointer-events-none rounded-full z-1 shadow-[0_0_120px_40px_rgba(3,7,18,1)]"
      />

      <Navbar />

      {/* Hero Content Wrapper */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 overflow-visible px-4">
        <div className="text-center flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[100px] sm:text-[120px] lg:text-[140px] font-medium leading-[1.02] tracking-[-0.024em] font-display flex flex-wrap justify-center translate-y-2"
          >
            <span className="text-foreground">VietTung </span>
            <span 
              className="bg-clip-text text-transparent px-2"
              style={{ 
                backgroundImage: 'linear-gradient(to left, #6366f1, #a855f7, #fcd34d)',
                WebkitBackgroundClip: 'text'
              }}
            >
              AI
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-hero-sub text-lg leading-8 max-w-md mt-[9px] text-center font-sans tracking-tight"
          >
            Internal tools for content, production, automation, and daily operations
          </motion.p>

          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-[25px] px-[29px] py-[24px] rounded-2xl liquid-glass font-semibold text-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/5 group active:scale-95 shadow-2xl tracking-wide"
          >
            Access Tools
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>

      <LogoMarquee />
    </div>
  );
}
