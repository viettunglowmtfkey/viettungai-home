import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, Wand2, Type } from 'lucide-react';
import { WatermarkTab } from './components/WatermarkTab';

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
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState(1);
  const [opacity1, setOpacity1] = useState(1);
  const [opacity2, setOpacity2] = useState(0);

  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

    const CROSSFADE_TIME = 1000; // 1 second crossfade
    let isTransitioning = false;

    const checkTime = () => {
      const active = activeVideo === 1 ? v1 : v2;
      const next = activeVideo === 1 ? v2 : v1;

      // Start transition when current video is near the end
      if (!isTransitioning && active.duration > 0 && active.currentTime > active.duration - (CROSSFADE_TIME / 1000 + 0.1)) {
        isTransitioning = true;
        
        // Reset and play the next one
        next.currentTime = 0;
        next.play().catch(() => {});

        // Crossfade opacities
        if (activeVideo === 1) {
          setOpacity1(0);
          setOpacity2(1);
          setTimeout(() => {
            setActiveVideo(2);
            v1.pause();
            isTransitioning = false;
          }, CROSSFADE_TIME);
        } else {
          setOpacity1(1);
          setOpacity2(0);
          setTimeout(() => {
            setActiveVideo(1);
            v2.pause();
            isTransitioning = false;
          }, CROSSFADE_TIME);
        }
      }
    };

    const interval = setInterval(checkTime, 100);
    return () => clearInterval(interval);
  }, [activeVideo]);

  const videoClass = "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out";

  return (
    <>
      <video
        ref={video1Ref}
        src={VIDEO_URL}
        muted
        playsInline
        autoPlay
        className={videoClass}
        style={{ opacity: opacity1 }}
      />
      <video
        ref={video2Ref}
        src={VIDEO_URL}
        muted
        playsInline
        className={videoClass}
        style={{ opacity: opacity2 }}
      />
    </>
  );
};

const Navbar = ({ onOpenTool, currentView }: { onOpenTool: (tool: string | null) => void, currentView: string | null }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="w-full py-5 px-8 flex flex-row justify-between items-center relative z-50">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onOpenTool(null)}>
        {/* Logo placeholder - styling it to look premium */}
        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center overflow-hidden shadow-lg border border-white/20">
          <div className="w-full h-full bg-gradient-to-br from-indigo-400 via-indigo-600 to-amber-400 opacity-80" />
          <span className="absolute text-white font-bold text-[10px] leading-none select-none tracking-tighter">VTAI</span>
        </div>
        <span className="font-display font-semibold text-xl tracking-tight text-foreground/95">VTAI</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <div 
          className="relative inline-block" 
          ref={dropdownRef}
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-1.5 transition-colors font-medium text-sm py-2 ${dropdownOpen || currentView === 'watermark' ? 'text-indigo-400' : 'text-foreground/90 hover:text-foreground'}`}
          >
            AI Tools
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Premium Dropdown Panel */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="absolute top-full left-0 pt-2 w-64 z-[100]"
              >
                <div className="liquid-glass rounded-2xl border border-white/5 shadow-2xl overflow-hidden p-2 bg-black/40 backdrop-blur-xl">
                  <div className="p-3 space-y-1">
                    <button 
                      onClick={() => { onOpenTool('watermark'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                        <Type className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Watermark Tool</div>
                        <div className="text-[10px] text-foreground/40 font-medium">Batch process SKU & labels</div>
                      </div>
                    </button>
                    
                    <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-foreground/30 font-bold">Planned Tools</div>
                    
                    <div className="w-full flex items-center gap-3 p-3 rounded-xl opacity-40 cursor-not-allowed">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <Wand2 className="w-5 h-5 text-foreground/40" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Scene AI</div>
                        <div className="text-[10px] text-foreground/40 font-medium">Coming soon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {["Operations", "Content", "System"].map((item) => (
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
          Core tools used across <br /> the VTAI system
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
  const [view, setView] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background relative flex flex-col overflow-hidden text-foreground selection:bg-white/20 selection:text-white">
      {/* Background Video Wrapper */}
      <div className="absolute inset-0 z-0 bg-background overflow-hidden">
        <HeroVideo />
      </div>

      {/* Blurred Overlay Shape */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[984px] h-[527px] transition-all duration-1000 ${view ? 'opacity-40 scale-150 blur-[120px]' : 'opacity-90 blur-[82px]'} bg-gray-950 pointer-events-none rounded-full z-1 shadow-[0_0_120px_40px_rgba(3,7,18,1)]`}
      />

      <Navbar onOpenTool={setView} currentView={view} />

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!view ? (
            <motion.div 
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center relative z-10 overflow-visible px-4"
            >
              <div className="text-center flex flex-col items-center">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[100px] sm:text-[120px] lg:text-[140px] font-medium leading-[1.02] tracking-[-0.024em] font-display flex flex-wrap justify-center translate-y-2"
                >
                  <span className="text-foreground">VIETTUNG </span>
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
                  onClick={() => setView('watermark')}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-[25px] px-[29px] py-[24px] rounded-2xl liquid-glass font-semibold text-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 border border-white/5 group active:scale-95 shadow-2xl tracking-wide"
                >
                  Access Tools
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tool"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 overflow-auto"
            >
              {view === 'watermark' && <WatermarkTab />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!view && <LogoMarquee />}
    </div>
  );
}
