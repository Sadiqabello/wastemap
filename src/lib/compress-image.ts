/**
 * Fast image compression using native Canvas API.
 * Much faster than browser-image-compression (no web worker overhead).
 */
export async function compressImage(
  file: File,
  {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.7,
    maxSizeKB = 500,
  }: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeKB?: number;
  } = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;

      // Scale down if needed
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try with initial quality
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }

          // If still too large, reduce quality further
          if (blob.size > maxSizeKB * 1024 && quality > 0.3) {
            canvas.toBlob(
              (smallerBlob) => {
                resolve(smallerBlob || blob);
              },
              "image/jpeg",
              0.4
            );
          } else {
            resolve(blob);
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      // Return original file if image can't be loaded
      resolve(file);
    };

    img.src = URL.createObjectURL(file);
  });
}
