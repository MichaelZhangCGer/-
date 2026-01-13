
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const downloadImage = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Simplified batch download for demonstration (Zip requires external lib like JSZip)
// We will trigger multiple downloads or instructions in this SPA scope
export const triggerBatchDownload = (samples: {url: string, id: string}[]) => {
  samples.forEach((sample, index) => {
    setTimeout(() => {
      downloadImage(sample.url, `augmented_sample_${sample.id}.png`);
    }, index * 200);
  });
};
