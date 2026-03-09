
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const resizeImageTo1080p = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      // Draw image to fill the 1920x1080 canvas
      ctx.drawImage(img, 0, 0, 1920, 1080);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error("Failed to load image for resizing"));
    img.src = url;
  });
};

export const downloadImage = async (url: string, filename: string) => {
  try {
    const resizedUrl = await resizeImageTo1080p(url);
    const link = document.createElement('a');
    link.href = resizedUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download image:", error);
  }
};

export const triggerBatchDownload = async (samples: {url: string, id: string}[]) => {
  try {
    const zip = new JSZip();
    
    // Process all images in parallel
    const resizePromises = samples.map(async (sample, index) => {
      const resizedUrl = await resizeImageTo1080p(sample.url);
      // Extract base64 data
      const base64Data = resizedUrl.split(',')[1];
      zip.file(`augmented_sample_${sample.id}.png`, base64Data, { base64: true });
    });
    
    await Promise.all(resizePromises);
    
    // Generate and download zip
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'augmented_samples.zip');
  } catch (error) {
    console.error("Failed to batch download images:", error);
  }
};
