export class ImageFrameProvider {
  constructor(onFrame) {
    this.onFrame = onFrame;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  async processImage(imageFile) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = async () => {
        // Redimensionner l'image pour les performances
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.drawImage(img, 0, 0, width, height);
        
        try {
          await this.onFrame(this.canvas);
          resolve({ width, height });
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }

  getProcessedCanvas() {
    return this.canvas;
  }
}