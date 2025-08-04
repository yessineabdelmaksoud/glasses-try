import { PUBLIC_PATH } from '../js/public_path';
import { ImageFrameProvider } from './image_frame_provider';
import { FacemeshLandmarksProvider } from '../js/facemesh/landmarks_provider';
import { SceneManager } from '../js/three_components/scene_manager';

const template = `
<div class="image-processor-container">
  <div class="upload-section">
    <h2>Virtual Glasses Try-On</h2>
    <div class="upload-area" id="uploadArea">
      <p>Drag an image here or click to select</p>
      <input type="file" id="imageInput" accept="image/*" hidden>
    </div>
    <button id="processBtn" disabled>Process Image</button>
  </div>
  
  <div class="processing-section" style="display: none;">
    <span class="loader">Processing...</span>
  </div>
  
  <div class="result-section" style="display: none;">
    <h3>Result</h3>
    <div class="image-comparison">
      <div class="original-image">
        <h4>Original Image</h4>
        <img id="originalImg" alt="Original">
      </div>
      <div class="processed-image">
        <h4>With Glasses</h4>
        <canvas class="output_canvas"></canvas>
      </div>
    </div>
    <div class="action-buttons">
      <button id="downloadBtn">Download</button>
      <button id="newImageBtn">New Image</button>
    </div>
  </div>
</div>
`;

document.querySelector("#app").innerHTML = template;

class StaticImageProcessor {
  constructor() {
    this.selectedFile = null;
    this.sceneManager = null;
    this.facemeshLandmarksProvider = null;
    this.imageFrameProvider = null;
    this.isProcessing = false;
    
    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.uploadArea = document.getElementById('uploadArea');
    this.imageInput = document.getElementById('imageInput');
    this.processBtn = document.getElementById('processBtn');
    this.canvas = document.querySelector('.output_canvas');
    this.originalImg = document.getElementById('originalImg');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.newImageBtn = document.getElementById('newImageBtn');
    
    this.uploadSection = document.querySelector('.upload-section');
    this.processingSection = document.querySelector('.processing-section');
    this.resultSection = document.querySelector('.result-section');
  }

  setupEventListeners() {
    // Upload area events
    this.uploadArea.addEventListener('click', () => this.imageInput.click());
    this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
    this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
    
    // File input
    this.imageInput.addEventListener('change', this.handleFileSelect.bind(this));
    
    // Buttons
    this.processBtn.addEventListener('click', this.processImage.bind(this));
    this.downloadBtn.addEventListener('click', this.downloadResult.bind(this));
    this.newImageBtn.addEventListener('click', this.resetProcessor.bind(this));
  }

  handleDragOver(e) {
    e.preventDefault();
    this.uploadArea.classList.add('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    this.uploadArea.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  handleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    this.selectedFile = file;
    this.processBtn.disabled = false;
    
    // Image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadArea.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px;">`;
    };
    reader.readAsDataURL(file);
  }

  async initializeProcessors() {
    if (this.sceneManager) return;

    const useOrtho = true;
    const debug = false;

    this.sceneManager = new SceneManager(this.canvas, debug, useOrtho);
    
    const onLandmarks = ({image, landmarks}) => {
      console.log('onLandmarks called. Image:', image, 'Landmarks:', landmarks ? landmarks.length : 'undefined');
      
      // Only process if we have valid landmarks
      if (!landmarks || landmarks.length === 0) {
        console.warn('Facial detection: FAILED, no landmarks detected');
        return; // Exit early if no landmarks
      }
      
      console.log('Facial detection: SUCCESS, landmarks found:', landmarks.length);
      
      // Ensure canvas exists and set dimensions properly
      if (!this.canvas) {
        console.error('Canvas not found!');
        return;
      }
      
      // First, ensure the canvas has the correct dimensions
      this.canvas.width = image.width;
      this.canvas.height = image.height;
      this.canvas.style.width = `${image.width}px`;
      this.canvas.style.height = `${image.height}px`;
      
      // Update scene manager with dimensions first, then image data
      this.sceneManager.resize(image.width, image.height);
      
      // Force renderer to set the correct size before processing landmarks
      this.sceneManager.renderer.setSize(image.width, image.height, false);
      
      // Now set the landmarks and image data
      this.sceneManager.onLandmarks(image, landmarks);
      
      // Debug: Log landmarks and glasses state
      console.log('Landmarks sample:', landmarks && landmarks.length > 0 ? landmarks[0] : 'none');
      if (this.sceneManager && this.sceneManager.glasses) {
        console.log('Glasses object:', this.sceneManager.glasses);
        if (typeof this.sceneManager.glasses.updateLandmarks === 'function') {
          console.log('Glasses.updateLandmarks is a function');
        } else {
          console.warn('Glasses.updateLandmarks is NOT a function');
        }
      } else {
        console.warn('SceneManager or glasses not initialized');
      }
      if (this.sceneManager && this.sceneManager.scene) {
        console.log('Scene children:', this.sceneManager.scene.children);
      }

      // Verify dimensions are correct
      console.log('Before animate - Canvas:', this.canvas.width, this.canvas.height);
      console.log('Before animate - Renderer:', this.sceneManager.renderer.domElement.width, this.sceneManager.renderer.domElement.height);
      
      // Call animate components individually to avoid problematic resizeRendererToDisplaySize
      if (this.sceneManager.controls) {
        this.sceneManager.controls.update();
      }
      
      // Update video background
      this.sceneManager.videoBg.update();
      
      // Update glasses
      this.sceneManager.glasses.update();
      
      // Ensure dimensions are still correct before rendering
      this.canvas.width = image.width;
      this.canvas.height = image.height;
      this.sceneManager.renderer.setSize(image.width, image.height, false);
      
      // Render scene
      this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
      
      // Debug: Log after rendering
      if (this.sceneManager && this.sceneManager.glasses) {
        console.log('Glasses mesh after update:', this.sceneManager.glasses.mesh ? this.sceneManager.glasses.mesh : 'No mesh');
      }
      if (this.sceneManager && this.sceneManager.scene) {
        console.log('Scene children after render:', this.sceneManager.scene.children);
      }

      // Log after rendering
      console.log('Manual render completed. Canvas size:', this.canvas.width, this.canvas.height);
      console.log('Renderer size:', this.sceneManager.renderer.domElement.width, this.sceneManager.renderer.domElement.height);
      console.log('Canvas attributes:', this.canvas.getAttribute('width'), this.canvas.getAttribute('height'));
    };

    this.facemeshLandmarksProvider = new FacemeshLandmarksProvider(onLandmarks);
    await this.facemeshLandmarksProvider.initialize();

    this.onFrame = async (imageCanvas) => {
      await this.facemeshLandmarksProvider.send(imageCanvas);
    };

    this.imageFrameProvider = new ImageFrameProvider(this.onFrame);
  }

  async processImage() {
    if (!this.selectedFile || this.isProcessing) return;

    this.isProcessing = true;
    this.showSection('processing');

    try {
      await this.initializeProcessors();
      
      // Afficher l'image originale
      const reader = new FileReader();
      reader.onload = (e) => {
        this.originalImg.src = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);

      // Traiter l'image
      const { width, height } = await this.imageFrameProvider.processImage(this.selectedFile);
      
      // Attendre un peu pour que le rendu se termine
      setTimeout(() => {
        this.showSection('result');
        this.isProcessing = false;
      }, 500);

    } catch (error) {
      console.error('Processing error:', error);
      alert('Error processing the image. Please try again.');
      this.showSection('upload');
      this.isProcessing = false;
    }
  }

  showSection(section) {
    this.uploadSection.style.display = section === 'upload' ? 'block' : 'none';
    this.processingSection.style.display = section === 'processing' ? 'block' : 'none';
    this.resultSection.style.display = section === 'result' ? 'block' : 'none';
  }

  downloadResult() {
    const link = document.createElement('a');
    link.download = 'glasses-result.png';
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  resetProcessor() {
    this.selectedFile = null;
    this.processBtn.disabled = true;
    this.uploadArea.innerHTML = '<p>Glissez une image ici ou cliquez pour sélectionner</p>';
    this.showSection('upload');
  }
}

// Initialiser l'application
new StaticImageProcessor();