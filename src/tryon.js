import "./styles.css";
import { PUBLIC_PATH } from './js/public_path';
import { CameraFrameProvider } from './js/camera_frame_provider';
import { ImageFrameProvider } from './image-to-image/image_frame_provider';
import { FacemeshLandmarksProvider } from './js/facemesh/landmarks_provider';
import { SceneManager } from "./js/three_components/scene_manager";

/**
 * Unified Virtual Glasses Try-On Application
 * Combines live camera and photo upload functionality
 */
class VirtualGlassesTryOn {
  constructor() {
    this.currentMode = 'video';
    this.availableGlasses = [
      {
        id: 1,
        name: 'Grey',
        color: 'grey',
        path: '/3d/Models/glasses/grey/grey.gltf'
      },
      {
        id: 2,
        name: 'Black',
        color: 'black', 
        path: '/3d/Models/glasses/black/black.gltf'
      },
      {
        id: 3,
        name: 'Brown',
        color: 'brown',
        path: '/3d/Models/glasses/brown/brown.gltf'
      }
    ];
    
    this.currentGlassesId = 1;
    
    // Video mode variables
    this.videoSceneManager = null;
    this.videoFacemeshProvider = null;
    this.cameraFrameProvider = null;
    this.videoElement = null;
    this.animationId = null;
    
    // Image mode variables
    this.imageSceneManager = null;
    this.imageFacemeshProvider = null;
    this.imageFrameProvider = null;
    this.selectedFile = null;
    this.isProcessing = false;
    
    this.init();
  }

  async init() {
    this.setupModeSelector();
    this.setupVideoMode();
    this.setupImageMode();
    await this.initializeVideoMode(); // Start with video mode
  }

  setupModeSelector() {
    const videomodeBtn = document.getElementById('videomodeBtn');
    const imagemodeBtn = document.getElementById('imagemodeBtn');
    
    videomodeBtn.addEventListener('click', () => this.switchMode('video'));
    imagemodeBtn.addEventListener('click', () => this.switchMode('image'));
  }

  async switchMode(mode) {
    console.log(`Switching to ${mode} mode`);
    
    // Clean up current mode
    this.cleanupCurrentMode();
    
    // Update UI
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.mode-content').forEach(content => content.classList.remove('active'));
    
    if (mode === 'video') {
      document.getElementById('videomodeBtn').classList.add('active');
      document.getElementById('videoMode').classList.add('active');
      this.currentMode = 'video';
      await this.initializeVideoMode();
    } else {
      document.getElementById('imagemodeBtn').classList.add('active');
      document.getElementById('imageMode').classList.add('active');
      this.currentMode = 'image';
      this.initializeImageMode();
    }
  }

  cleanupCurrentMode() {
    // Stop video mode
    if (this.cameraFrameProvider) {
      this.cameraFrameProvider.stop();
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Reset image mode
    this.resetImageProcessor();
  }

  // ========== VIDEO MODE IMPLEMENTATION ==========
  async setupVideoMode() {
    this.createVideoGlassesSelector();
  }

  createVideoGlassesSelector() {
    const glassesButtons = document.getElementById('videoGlassesButtons');
    glassesButtons.innerHTML = ''; // Clear existing buttons
    
    this.availableGlasses.forEach(glasses => {
      const button = document.createElement('button');
      button.className = 'glasses-btn';
      button.textContent = glasses.name;
      button.setAttribute('data-glasses-id', glasses.id);
      
      if (glasses.id === this.currentGlassesId) {
        button.classList.add('active');
      }
      
      button.addEventListener('click', () => {
        this.selectGlasses(glasses, 'video');
      });
      
      glassesButtons.appendChild(button);
    });
  }

  async initializeVideoMode() {
    console.log('Initializing video mode...');
    
    const videoContainer = document.querySelector('.video-container');
    videoContainer.classList.add('loading');

    const canvas = document.getElementById('videoCanvas');
    const useOrtho = true;
    const debug = false;

    const onLandmarks = ({image, landmarks}) => {
      if (this.videoSceneManager) {
        this.videoSceneManager.onLandmarks(image, landmarks);
      }
    };

    const onFrame = async (video) => {
      try {
        if (this.videoFacemeshProvider) {
          await this.videoFacemeshProvider.send(video);
        }
      } catch (e) {
        console.error("Camera error:", e);
        if (this.cameraFrameProvider) {
          this.cameraFrameProvider.stop();
        }
      }
    };

    try {
      this.videoSceneManager = new SceneManager(canvas, debug, useOrtho);
      this.videoFacemeshProvider = new FacemeshLandmarksProvider(onLandmarks);

      // Create video element
      if (!this.videoElement) {
        this.videoElement = document.createElement("video");
        this.videoElement.setAttribute("playsinline", "");
        this.videoElement.style.display = "none";
        document.body.appendChild(this.videoElement);
      }

      this.cameraFrameProvider = new CameraFrameProvider(this.videoElement, onFrame);
      
      await this.videoFacemeshProvider.initialize();
      await this.cameraFrameProvider.start();

      // Load default glasses
      await this.loadGlassesModel(this.availableGlasses[0].path, 'video');

      // Show glasses selector
      document.getElementById('videoGlassesSelector').style.display = 'block';

      // Start animation loop
      this.animate();

      videoContainer.classList.remove('loading');
      console.log('Video mode initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize video mode:', error);
      videoContainer.classList.remove('loading');
      videoContainer.innerHTML = '<div class="error">Failed to access camera. Please check permissions.</div>';
    }
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    if (this.videoSceneManager && this.currentMode === 'video') {
      this.videoSceneManager.resize(800, 500);
      this.videoSceneManager.animate();
    }
  }

  // ========== IMAGE MODE IMPLEMENTATION ==========
  setupImageMode() {
    this.createImageGlassesSelector();
    this.setupImageEventListeners();
  }

  createImageGlassesSelector() {
    const glassesButtons = document.getElementById('imageGlassesButtons');
    glassesButtons.innerHTML = ''; // Clear existing buttons
    
    this.availableGlasses.forEach(glasses => {
      const button = document.createElement('button');
      button.className = 'static-glasses-btn';
      button.textContent = glasses.name;
      button.setAttribute('data-glasses-id', glasses.id);
      
      if (glasses.id === this.currentGlassesId) {
        button.classList.add('active');
      }
      
      button.addEventListener('click', () => {
        this.selectGlasses(glasses, 'image');
      });
      
      glassesButtons.appendChild(button);
    });
  }

  setupImageEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const processBtn = document.getElementById('processBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const newImageBtn = document.getElementById('newImageBtn');

    uploadArea.addEventListener('click', () => imageInput.click());
    uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
    uploadArea.addEventListener('drop', this.handleDrop.bind(this));
    
    imageInput.addEventListener('change', this.handleFileSelect.bind(this));
    processBtn.addEventListener('click', this.processImage.bind(this));
    downloadBtn.addEventListener('click', this.downloadResult.bind(this));
    newImageBtn.addEventListener('click', this.resetImageProcessor.bind(this));
  }

  initializeImageMode() {
    console.log('Image mode ready');
    // Image mode is ready when user uploads a file
  }

  // ========== SHARED FUNCTIONALITY ==========
  selectGlasses(glasses, mode) {
    console.log(`Selecting glasses: ${glasses.name} for ${mode} mode`);
    
    // Update active button for the current mode
    const buttonsContainer = mode === 'video' ? 'videoGlassesButtons' : 'imageGlassesButtons';
    const buttonClass = mode === 'video' ? '.glasses-btn' : '.static-glasses-btn';
    
    document.querySelectorAll(`#${buttonsContainer} ${buttonClass}`).forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`#${buttonsContainer} [data-glasses-id="${glasses.id}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
    
    this.currentGlassesId = glasses.id;
    this.loadGlassesModel(glasses.path, mode);
  }

  async loadGlassesModel(glassesPath, mode) {
    const sceneManager = mode === 'video' ? this.videoSceneManager : this.imageSceneManager;
    
    if (sceneManager && sceneManager.glasses) {
      const fullPath = `${PUBLIC_PATH}${glassesPath}`;
      try {
        await sceneManager.glasses.loadGlasses(fullPath);
        console.log(`Loaded glasses model for ${mode} mode:`, fullPath);
      } catch (error) {
        console.error(`Failed to load glasses model for ${mode} mode:`, error);
      }
    } else {
      console.error(`SceneManager not available for ${mode} mode`);
    }
  }

  // ========== IMAGE PROCESSING METHODS ==========
  handleDragOver(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.add('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    document.getElementById('uploadArea').classList.remove('drag-over');
    
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
    document.getElementById('processBtn').disabled = false;
    
    // Image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('uploadArea').innerHTML = 
        `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px;">`;
    };
    reader.readAsDataURL(file);
  }

  async processImage() {
    if (!this.selectedFile || this.isProcessing) return;

    this.isProcessing = true;
    this.showImageSection('processing');

    try {
      await this.initializeImageProcessors();
      
      // Load the selected glasses model
      const selectedGlasses = this.availableGlasses.find(g => g.id === this.currentGlassesId);
      if (selectedGlasses && this.imageSceneManager && this.imageSceneManager.glasses) {
        await this.imageSceneManager.glasses.loadGlasses(`${PUBLIC_PATH}${selectedGlasses.path}`);
      }
      
      // Show original image
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('originalImg').src = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);

      // Process the image
      await this.imageFrameProvider.processImage(this.selectedFile);
      
      // Wait for rendering to complete
      setTimeout(() => {
        this.showImageSection('result');
        this.isProcessing = false;
      }, 500);

    } catch (error) {
      console.error('Processing error:', error);
      alert(`Error processing the image: ${error.message || 'Unknown error'}.`);
      this.showImageSection('upload');
      this.isProcessing = false;
    }
  }

  async initializeImageProcessors() {
    if (this.imageSceneManager) return;

    const canvas = document.getElementById('imageCanvas');
    const useOrtho = true;
    const debug = false;

    this.imageSceneManager = new SceneManager(canvas, debug, useOrtho);
    
    const onLandmarks = ({image, landmarks}) => {
      if (!landmarks || landmarks.length === 0) {
        console.warn('Facial detection failed: no landmarks detected');
        return;
      }
      
      if (!canvas) {
        console.error('Canvas not found!');
        return;
      }
      
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.style.width = `${image.width}px`;
      canvas.style.height = `${image.height}px`;
      
      this.imageSceneManager.resize(image.width, image.height);
      this.imageSceneManager.renderer.setSize(image.width, image.height, false);
      this.imageSceneManager.onLandmarks(image, landmarks);
      this.imageSceneManager.updateCamera();
      this.imageSceneManager.glasses.updateDimensions(image.width, image.height);
      this.imageSceneManager.videoBg.updateDimensions(image.width, image.height);
      
      if (this.imageSceneManager.controls) {
        this.imageSceneManager.controls.update();
      }
      
      this.imageSceneManager.videoBg.update();
      this.imageSceneManager.glasses.update();
      this.imageSceneManager.renderer.render(this.imageSceneManager.scene, this.imageSceneManager.camera);
    };

    this.imageFacemeshProvider = new FacemeshLandmarksProvider(onLandmarks);
    
    const onFrame = async (canvas) => {
      try {
        await this.imageFacemeshProvider.send(canvas);
      } catch (error) {
        console.error('Error in facemesh processing:', error);
        throw error;
      }
    };
    
    this.imageFrameProvider = new ImageFrameProvider(onFrame);
    await this.imageFacemeshProvider.initialize();
  }

  showImageSection(section) {
    const uploadSection = document.querySelector('.upload-section');
    const processingSection = document.querySelector('.processing-section');
    const resultSection = document.querySelector('.result-section');

    uploadSection.style.display = section === 'upload' ? 'block' : 'none';
    processingSection.style.display = section === 'processing' ? 'block' : 'none';
    resultSection.style.display = section === 'result' ? 'block' : 'none';
  }

  downloadResult() {
    try {
      const canvas = document.getElementById('imageCanvas');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `tryon-${timestamp}.png`;
      
      const dataURL = canvas.toDataURL('image/png', 1.0);
      
      if (this.isBrowserSupportsDownload()) {
        this.downloadWithLink(dataURL, filename);
      } else {
        this.downloadWithBlob(dataURL, filename);
      }
      
      console.log(`✅ Downloaded try-on result as: ${filename}`);
      this.showDownloadFeedback();
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      this.showDownloadError(error.message);
    }
  }

  // Download helper methods
  isBrowserSupportsDownload() {
    const link = document.createElement('a');
    return typeof link.download !== 'undefined';
  }

  downloadWithLink(dataURL, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    }, 100);
  }

  downloadWithBlob(dataURL, filename) {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    
    const buffer = new ArrayBuffer(byteString.length);
    const data = new Uint8Array(buffer);
    
    for (let i = 0; i < byteString.length; i++) {
      data[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([buffer], { type: mimeString });
    
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else if (window.URL && window.URL.createObjectURL) {
      const blobURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobURL);
    } else {
      const newWindow = window.open(dataURL, '_blank');
      if (!newWindow) {
        throw new Error('Download failed. Please allow popups and try again.');
      }
    }
  }

  showDownloadFeedback() {
    const button = document.getElementById('downloadBtn');
    const originalText = button.textContent;
    
    button.textContent = '✅ Downloaded!';
    button.style.backgroundColor = '#4CAF50';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
      button.disabled = false;
    }, 2000);
  }

  showDownloadError(errorMessage) {
    const button = document.getElementById('downloadBtn');
    const originalText = button.textContent;
    
    button.textContent = '❌ Download Failed';
    button.style.backgroundColor = '#f44336';
    
    alert(`Download failed: ${errorMessage}\n\nPlease try again or check your browser settings.`);
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
    }, 3000);
  }

  resetImageProcessor() {
    this.selectedFile = null;
    const processBtn = document.getElementById('processBtn');
    const uploadArea = document.getElementById('uploadArea');
    
    if (processBtn) processBtn.disabled = true;
    if (uploadArea) uploadArea.innerHTML = '<p>Drag an image here or click to select</p>';
    this.showImageSection('upload');
  }
}

// Initialize the unified application
new VirtualGlassesTryOn();
