import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Trash2, 
  Download, 
  Settings2, 
  Image as ImageIcon, 
  Maximize2, 
  ChevronDown,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Archive
} from 'lucide-react';
import JSZip from 'jszip';
import { WatermarkSettings, ImageFile, WatermarkPosition } from '../types';
import { processWatermark } from '../lib/watermark';

const DEFAULT_SETTINGS: WatermarkSettings = {
  text: '',
  position: 'bottom-right',
  padding: 5,
  fontSizeType: 'auto',
  fontSizeValue: 5,
  color: '#ffffff',
  opacity: 0.8,
  hasShadow: true,
  hasOutline: false,
  hasBackgroundChip: false,
  rotation: 0,
  jpegQuality: 0.9,
};

export const WatermarkTab: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<WatermarkSettings>({
    ...DEFAULT_SETTINGS,
    text: '', // Start empty to show fallback logic result in preview
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getEffectiveText = useCallback(() => {
    return settings.text || "VIETTUNG AI"; // Project title fallback
  }, [settings.text]);

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = Array.from(files).map((file: File) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name,
      file: file,
    }));

    setImages(prev => [...prev, ...newImages]);
    if (!activeImageId && newImages.length > 0) {
      setActiveImageId(newImages[0].id);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      if (activeImageId === id) {
        setActiveImageId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const clearAll = () => {
    setImages([]);
    setActiveImageId(null);
    setPreviewUrl(null);
  };

  // Modify processWatermark to use the effective text
  const updatePreview = useCallback(async () => {
    const activeImage = images.find(img => img.id === activeImageId);
    if (!activeImage) {
      setPreviewUrl(null);
      return;
    }

    try {
      const effectSettings = { ...settings, text: getEffectiveText() };
      const result = await processWatermark(activeImage.url, effectSettings);
      setPreviewUrl(result);
    } catch (err) {
      console.error("Preview failed", err);
    }
  }, [activeImageId, images, settings, getEffectiveText]);

  // System Images for "Gallery" source selection
  const addSystemImages = () => {
    const systemImages: ImageFile[] = [
      { id: 'sys1', url: 'https://images.unsplash.com/photo-1620121692029-d088224efc74?auto=format&fit=crop&q=80&w=1600', name: 'Product_Shot_A.jpg' },
      { id: 'sys2', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600', name: 'UI_Interface_Dark.jpg' },
      { id: 'sys3', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1600', name: 'Tech_Equipment.jpg' },
    ];
    setImages(prev => {
        const unique = systemImages.filter(s => !prev.some(p => p.url === s.url));
        return [...prev, ...unique];
    });
    if (!activeImageId && systemImages.length > 0) setActiveImageId(systemImages[0].id);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview();
    }, 150); // Debounce
    return () => clearTimeout(timer);
  }, [updatePreview]);

  // Batch processing
  const startBatchProcessing = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProcessingProgress(0);

    const processedImages = [...images];
    
    for (let i = 0; i < images.length; i++) {
        try {
            const result = await processWatermark(images[i].url, settings);
            processedImages[i] = { ...processedImages[i], processedUrl: result };
            setProcessingProgress(Math.round(((i + 1) / images.length) * 100));
        } catch (err) {
            console.error(`Failed to process ${images[i].name}`, err);
        }
    }

    setImages(processedImages);
    setIsProcessing(false);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const processedOnes = images.filter(img => img.processedUrl);
    
    if (processedOnes.length === 0) {
        // If not processed yet, process them first or just notify?
        // For simplicity, let's assume batch processing must be run first or we run it now
        return;
    }

    processedOnes.forEach(img => {
      const base64Data = img.processedUrl!.split(',')[1];
      zip.file(`watermarked_${img.name.split('.')[0]}.jpg`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `VTAI_Watermarked_${Date.now()}.zip`;
    link.click();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Left Panel: Controls */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <div className="liquid-glass rounded-3xl p-6 border border-white/5 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-400" />
              Settings
            </h2>
            <button 
              onClick={() => setSettings(DEFAULT_SETTINGS)}
              className="text-xs text-foreground/50 hover:text-indigo-400 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="space-y-4">
            {/* Image Selection Area */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Source Images</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-1 group"
                >
                  <Upload className="w-4 h-4 text-foreground/40 group-hover:text-indigo-400" />
                  <span className="text-[10px] text-foreground/60 group-hover:text-foreground">Upload</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </button>
                
                <button 
                  onClick={addSystemImages}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-1 group"
                >
                  <ImageIcon className="w-4 h-4 text-foreground/40 group-hover:text-indigo-400" />
                  <span className="text-[10px] text-foreground/60 group-hover:text-foreground">Gallery</span>
                </button>
              </div>

              {images.length > 0 && (
                <div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                  <span className="text-[10px] font-medium text-foreground/80">{images.length} images selected</span>
                  <button onClick={clearAll} className="text-[10px] text-rose-400 hover:text-rose-300 font-bold">Clear</button>
                </div>
              )}
            </div>

            {/* Watermark Content */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Watermark Text</label>
              <input 
                type="text"
                placeholder="Enter text (e.g. SKU_123)"
                value={settings.text}
                onChange={(e) => setSettings(prev => ({ ...prev, text: e.target.value }))}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            {/* Position Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Position</label>
              <div className="grid grid-cols-2 gap-2">
                {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as WatermarkPosition[]).map(pos => (
                   <button
                    key={pos}
                    onClick={() => setSettings(prev => ({ ...prev, position: pos }))}
                    className={`text-[10px] py-2 rounded-lg border transition-all ${
                      settings.position === pos 
                        ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'
                    }`}
                  >
                    {pos.replace('-', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Styling Controls */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-foreground/60 uppercase font-bold">Font Size</label>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setSettings(prev => ({ ...prev, fontSizeType: 'auto' }))}
                      className={`flex-1 text-[9px] py-1 rounded ${settings.fontSizeType === 'auto' ? 'bg-white/10 text-white' : 'text-foreground/40'}`}
                    >Auto</button>
                    <button 
                      onClick={() => setSettings(prev => ({ ...prev, fontSizeType: 'fixed' }))}
                      className={`flex-1 text-[9px] py-1 rounded ${settings.fontSizeType === 'fixed' ? 'bg-white/10 text-white' : 'text-foreground/40'}`}
                    >Fixed</button>
                  </div>
                  <input 
                    type="range" 
                    min={settings.fontSizeType === 'auto' ? 1 : 10} 
                    max={settings.fontSizeType === 'auto' ? 20 : 200}
                    value={settings.fontSizeValue}
                    onChange={(e) => setSettings(prev => ({ ...prev, fontSizeValue: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] text-foreground/60 uppercase font-bold">Padding</label>
                   <input 
                    type="range" 
                    min="0" 
                    max="20"
                    value={settings.padding}
                    onChange={(e) => setSettings(prev => ({ ...prev, padding: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-foreground/60 uppercase font-bold">Opacity</label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1" 
                    step="0.1"
                    value={settings.opacity}
                    onChange={(e) => setSettings(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-foreground/60 uppercase font-bold">Color</label>
                  <div className="flex gap-2">
                    <input 
                      type="color"
                      value={settings.color}
                      onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                      className="w-8 h-8 rounded bg-transparent border-none cursor-pointer"
                    />
                    <input 
                      type="text"
                      value={settings.color}
                      onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 bg-white/5 border border-white/10 rounded px-2 text-[10px] uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'hasShadow', label: 'Shadow' },
                  { id: 'hasOutline', label: 'Outline' },
                  { id: 'hasBackgroundChip', label: 'Chip' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSettings(prev => ({ ...prev, [opt.id]: !prev[opt.id as keyof WatermarkSettings] }))}
                    className={`py-2 rounded-lg border text-[10px] font-medium transition-all ${
                      settings[opt.id as keyof WatermarkSettings] 
                        ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                        : 'bg-white/5 border-transparent text-foreground/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="flex items-center bg-white/5 border border-transparent rounded-lg px-2 gap-1 overflow-hidden">
                   <span className="text-[9px] text-foreground/40 font-bold uppercase rotate-[-90deg]">Rot</span>
                   <input 
                    type="number"
                    value={settings.rotation}
                    onChange={(e) => setSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-transparent text-[10px] focus:outline-none"
                   />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
             <button 
                disabled={images.length === 0 || isProcessing}
                onClick={startBatchProcessing}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
             >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing {processingProgress}%</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Process All ({images.length})</span>
                  </>
                )}
             </button>

             {images.some(img => img.processedUrl) && (
               <button 
                 onClick={downloadAll}
                 className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-semibold flex items-center justify-center gap-2 border border-white/10"
               >
                 <Archive className="w-4 h-4" />
                 <span>Export ZIP</span>
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Right Panel: Preview and Results */}
      <div className="flex-1 space-y-6 overflow-hidden flex flex-col">
        {/* Main Preview Area */}
        <div className="flex-1 liquid-glass rounded-3xl border border-white/5 relative overflow-hidden bg-black/40 min-h-[400px] group">
          <AnimatePresence mode="wait">
            {previewUrl ? (
              <motion.div 
                key={activeImageId + JSON.stringify(settings)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full p-8 flex items-center justify-center"
              >
                <div className="relative max-w-full max-h-full shadow-2xl rounded-lg overflow-hidden border border-white/10">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full max-h-[calc(100vh-400px)] object-contain block mx-auto"
                  />
                  <div className="absolute top-4 right-4 py-1 px-2 bg-black/60 backdrop-blur-md rounded-md border border-white/10 text-[10px] font-mono text-white/50 uppercase">
                    Preview Mode
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-foreground/20 gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">No Image Selected</p>
                  <p className="text-xs">Upload images to begin watermarking</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Images Grid / Thumbnails */}
        {images.length > 0 && (
          <div className="h-32 flex-shrink-0 bg-white/5 rounded-3xl p-4 border border-white/5 overflow-x-auto">
            <div className="flex gap-4 h-full">
              {images.map((img) => (
                <div 
                  key={img.id}
                  className={`relative h-full aspect-square rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${activeImageId === img.id ? 'border-indigo-500 scale-105' : 'border-white/5 opacity-50 hover:opacity-100'}`}
                  onClick={() => setActiveImageId(img.id)}
                >
                  <img src={img.processedUrl || img.url} alt={img.name} className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {img.processedUrl && (
                    <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-0.5 shadow-lg">
                       <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {activeImageId === img.id && (
                     <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
