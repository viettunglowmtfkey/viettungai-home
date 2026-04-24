export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface WatermarkSettings {
  text: string;
  position: WatermarkPosition;
  padding: number;
  fontSizeType: 'fixed' | 'auto';
  fontSizeValue: number; // px or percentage
  color: string;
  opacity: number;
  hasShadow: boolean;
  hasOutline: boolean;
  hasBackgroundChip: boolean;
  rotation: number;
  jpegQuality: number;
}

export interface ImageFile {
  id: string;
  url: string;
  name: string;
  file?: File;
  processedUrl?: string;
}
