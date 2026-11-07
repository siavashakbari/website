/**
 * Client-side image optimizer conforming to portfolio standard:
 * Max 2000px long edge, 82% JPEG compression for optimal load speed and quality.
 */
export async function optimizeImageFile(
  file: File,
): Promise<{ url: string; width: number; height: number; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const MAX_EDGE = 2000;
        if (width > MAX_EDGE || height > MAX_EDGE) {
          if (width >= height) {
            height = Math.round((height * MAX_EDGE) / width);
            width = MAX_EDGE;
          } else {
            width = Math.round((width * MAX_EDGE) / height);
            height = MAX_EDGE;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));
        ctx.drawImage(img, 0, 0, width, height);
        const url = canvas.toDataURL("image/jpeg", 0.82);
        const sizeKb = Math.round((url.length * 3) / 4 / 1024);
        resolve({ url, width, height, sizeKb });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
