import { PUBLIC_PATH } from '../js/public_path';
import { ImageFrameProvider } from './image_frame_provider';
import { FacemeshLandmarksProvider } from '../js/facemesh/landmarks_provider';
import { SceneManager } from '../js/three_components/scene_manager';

const template = `
<div class="image-processor-container">
  <div class="upload-section">
    <h2>Virtual Glasses Try-On</h2>
    
    <div class="static-glasses-selector">
      <h3>Choose Your Glasses</h3>
      <div class="static-glasses-buttons" id="staticGlassesButtons">
        <!-- Buttons will be added dynamically -->
      </div>
    </div>
    
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

// Available glasses models (same as main interface)
const availableGlasses = [
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

class StaticImageProcessor {
  constructor() {
    this.selectedFile = null;
    this.sceneManager = null;
    this.facemeshLandmarksProvider = null;
    this.imageFrameProvider = null;
    this.isProcessing = false;
    this.currentGlassesId = 1; // Default to Grey glasses
    
    this.initializeElements();
    this.setupEventListeners();
    this.createGlassesSelector();
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

  createGlassesSelector() {
    const glassesButtons = document.getElementById('staticGlassesButtons');
    
    availableGlasses.forEach(glasses => {
      const button = document.createElement('button');
      button.className = 'static-glasses-btn';
      button.textContent = glasses.name;
      button.setAttribute('data-glasses-id', glasses.id);
      
      // Set first button as active
      if (glasses.id === this.currentGlassesId) {
        button.classList.add('active');
      }
      
      button.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.static-glasses-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update current glasses selection
        this.currentGlassesId = glasses.id;
        console.log('Selected glasses:', glasses.name);
      });
      
      glassesButtons.appendChild(button);
    });
  }

  getCurrentGlassesPath() {
    const selectedGlasses = availableGlasses.find(g => g.id === this.currentGlassesId);
    return selectedGlasses ? `${PUBLIC_PATH}${selectedGlasses.path}` : null;
  }

  showSection(section) {
    this.uploadSection.style.display = section === 'upload' ? 'block' : 'none';
    this.processingSection.style.display = section === 'processing' ? 'block' : 'none';
    this.resultSection.style.display = section === 'result' ? 'block' : 'none';
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
      // Only process if we have valid landmarks
      if (!landmarks || landmarks.length === 0) {
        console.warn('Facial detection failed: no landmarks detected');
        return; // Exit early if no landmarks
      }
      
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
      
      // Set proper dimensions for SceneManager
      this.sceneManager.resize(image.width, image.height);
      
      // Force renderer to set the correct size before processing landmarks
      this.sceneManager.renderer.setSize(image.width, image.height, false);
      
      // Now set the landmarks and image data
      this.sceneManager.onLandmarks(image, landmarks);
      
      // Update camera properly for static image (this was missing before)
      this.sceneManager.updateCamera();
      
      // Update dimensions for glasses and video background (this was missing before)
      this.sceneManager.glasses.updateDimensions(image.width, image.height);
      this.sceneManager.videoBg.updateDimensions(image.width, image.height);
      
      // Call rendering components individually (without problematic resizeRendererToDisplaySize)
      if (this.sceneManager.controls) {
        this.sceneManager.controls.update();
      }
      
      // Update video background
      this.sceneManager.videoBg.update();
      
      // Update glasses
      this.sceneManager.glasses.update();
      
      // Render scene
      this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
    };

    this.facemeshLandmarksProvider = new FacemeshLandmarksProvider(onLandmarks);
    
    // Create proper onFrame callback for ImageFrameProvider
    const onFrame = async (canvas) => {
      try {
        await this.facemeshLandmarksProvider.send(canvas);
      } catch (error) {
        console.error('Error in facemesh processing:', error);
        throw error;
      }
    };
    
    this.imageFrameProvider = new ImageFrameProvider(onFrame);
    
    await this.facemeshLandmarksProvider.initialize();
  }

  async processImage() {
    if (!this.selectedFile || this.isProcessing) return;

    this.isProcessing = true;
    this.showSection('processing');

    try {
      await this.initializeProcessors();
      
      // Load the selected glasses model
      const selectedGlassesPath = this.getCurrentGlassesPath();
      
      if (selectedGlassesPath && this.sceneManager && this.sceneManager.glasses) {
        await this.sceneManager.glasses.loadGlasses(selectedGlassesPath);
      }
      
      // Show original image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.originalImg.src = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);

      // Process the image
      // Process the image
      const { width, height } = await this.imageFrameProvider.processImage(this.selectedFile);
      
      // Wait a bit for rendering to complete
      setTimeout(() => {
        this.showSection('result');
        this.isProcessing = false;
      }, 500);

    } catch (error) {
      console.error('Processing error:', error.message || 'Unknown error');
      alert(`Error processing the image: ${error.message || 'Unknown error'}.`);
      this.showSection('upload');
      this.isProcessing = false;
    }
  }

  downloadResult() {
    try {
      // Generate filename with timestamp for uniqueness
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `tryon-${timestamp}.png`;
      
      // Get canvas data as PNG
      const dataURL = this.canvas.toDataURL('image/png', 1.0);
      
      // Check if browser supports download attribute
      if (this.isBrowserSupportsDownload()) {
        this.downloadWithLink(dataURL, filename);
      } else {
        // Fallback for older browsers or mobile
        this.downloadWithBlob(dataURL, filename);
      }
      
      console.log(`✅ Downloaded try-on result as: ${filename}`);
      
      // Optional: Show success feedback to user
      this.showDownloadFeedback();
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      this.showDownloadError(error.message);
    }
  }

  // Check if browser supports download attribute
  isBrowserSupportsDownload() {
    const link = document.createElement('a');
    return typeof link.download !== 'undefined';
  }

  // Primary download method using anchor element
  downloadWithLink(dataURL, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    
    // Add to DOM temporarily for better compatibility
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    }, 100);
  }

  // Alternative download method using Blob for better mobile support
  downloadWithBlob(dataURL, filename) {
    // Convert data URL to blob
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    
    const buffer = new ArrayBuffer(byteString.length);
    const data = new Uint8Array(buffer);
    
    for (let i = 0; i < byteString.length; i++) {
      data[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([buffer], { type: mimeString });
    
    // Use different methods based on browser capabilities
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // IE/Edge support
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else if (window.URL && window.URL.createObjectURL) {
      // Modern browsers
      const blobURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobURL);
    } else {
      // Fallback: open in new window (user can save manually)
      const newWindow = window.open(dataURL, '_blank');
      if (!newWindow) {
        throw new Error('Download failed. Please allow popups and try again.');
      }
    }
  }

  // Show success feedback to user
  showDownloadFeedback() {
    const button = this.downloadBtn;
    const originalText = button.textContent;
    
    // Temporarily change button text to show success
    button.textContent = '✅ Downloaded!';
    button.style.backgroundColor = '#4CAF50';
    button.disabled = true;
    
    // Reset after 2 seconds
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
      button.disabled = false;
    }, 2000);
  }

  // Show error feedback to user
  showDownloadError(errorMessage) {
    const button = this.downloadBtn;
    const originalText = button.textContent;
    
    // Temporarily change button text to show error
    button.textContent = '❌ Download Failed';
    button.style.backgroundColor = '#f44336';
    
    // Show error message to user
    alert(`Download failed: ${errorMessage}\n\nPlease try again or check your browser settings.`);
    
    // Reset after 3 seconds
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
    }, 3000);
  }

  resetProcessor() {
    this.selectedFile = null;
    this.processBtn.disabled = true;
    this.uploadArea.innerHTML = '<p>Drag an image here or click to select</p>';
    this.showSection('upload');
  }
}

// Initialize the processor
new StaticImageProcessor();
