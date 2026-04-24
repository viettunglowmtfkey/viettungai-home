import { WatermarkSettings } from "../types";

/**
 * Processes an image by applying a canvas-based watermark.
 */
export async function processWatermark(
  imageSrc: string,
  settings: WatermarkSettings
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Could not get canvas context");

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure text styling
      const fontSize = settings.fontSizeType === 'auto' 
        ? (canvas.width * (settings.fontSizeValue / 100))
        : settings.fontSizeValue;
      
      ctx.font = `bold ${fontSize}px "Geist Sans", sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      const text = settings.text || "VTAI Preview";
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize; // Approximation

      // Constants
      const margin = (canvas.width * (settings.padding / 100));
      
      let x = 0;
      let y = 0;

      switch (settings.position) {
        case 'top-left':
          x = margin;
          y = margin + textHeight / 2;
          break;
        case 'top-right':
          x = canvas.width - textWidth - margin;
          y = margin + textHeight / 2;
          break;
        case 'bottom-left':
          x = margin;
          y = canvas.height - margin - textHeight / 2;
          break;
        case 'bottom-right':
          x = canvas.width - textWidth - margin;
          y = canvas.height - margin - textHeight / 2;
          break;
      }

      // Apply rotation if needed
      ctx.save();
      // Translate to text center for rotation
      const centerX = x + textWidth / 2;
      const centerY = y;
      ctx.translate(centerX, centerY);
      ctx.rotate((settings.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      // Background Chip
      if (settings.hasBackgroundChip) {
        ctx.fillStyle = `rgba(0,0,0,${0.5 * settings.opacity})`;
        const paddingX = fontSize * 0.4;
        const paddingY = fontSize * 0.2;
        ctx.roundRect(
          x - paddingX, 
          y - textHeight / 2 - paddingY, 
          textWidth + paddingX * 2, 
          textHeight + paddingY * 2, 
          fontSize * 0.2
        );
        ctx.fill();
      }

      // Shadow
      if (settings.hasShadow) {
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = fontSize / 10;
        ctx.shadowOffsetX = fontSize / 20;
        ctx.shadowOffsetY = fontSize / 20;
      }

      // Outline
      if (settings.hasOutline) {
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = fontSize / 15;
        ctx.strokeText(text, x, y);
      }

      // Final Text
      const color = settings.color.startsWith('#') ? settings.color : '#ffffff';
      // Add alpha to hex if needed or use global alpha
      ctx.globalAlpha = settings.opacity;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);

      ctx.restore();

      // Export
      const result = canvas.toDataURL("image/jpeg", settings.jpegQuality);
      resolve(result);
    };

    img.onerror = (e) => {
      reject("Image loading failed");
    };
  });
}
