import "./styles.css";
import { PUBLIC_PATH } from './js/public_path';
import { CameraFrameProvider } from './js/camera_frame_provider';
import { FacemeshLandmarksProvider } from './js/facemesh/landmarks_provider';
import { SceneManager } from "./js/three_components/scene_manager";

const template = `
<div class="video-container">
  <span class="loader">
    Loading...
  </span>
  <div>
    <h2>Live Glasses Try-On</h2>
    <canvas class="output_canvas"></canvas>
  </div>
</div>

<div class="glasses-selector" id="glassesSelector" style="display: none;">
  <h3>Choose Your Glasses</h3>
  <div class="glasses-buttons" id="glassesButtons">
    <!-- Buttons will be added dynamically -->
  </div>
</div>
`;

document.querySelector("#app").innerHTML = template;

// Global variables
let sceneManager;
let facemeshLandmarksProvider;
let cameraFrameProvider;

// Available glasses models (this will later come from database)
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

let currentGlassesId = 1; // Default to Grey glasses

function createGlassesSelector() {
  const glassesButtons = document.getElementById('glassesButtons');
  
  availableGlasses.forEach(glasses => {
    const button = document.createElement('button');
    button.className = 'glasses-btn';
    button.textContent = glasses.name;
    button.setAttribute('data-glasses-id', glasses.id);
    
    // Set first button as active
    if (glasses.id === currentGlassesId) {
      button.classList.add('active');
    }
    
    button.addEventListener('click', () => {
      console.group('🔘 Button Click Debug');
      console.log('Clicked button:', button.textContent);
      console.log('Button data-id:', button.getAttribute('data-glasses-id'));
      console.log('Previous active glasses ID:', currentGlassesId);
      console.log('New glasses data:', glasses);
      
      // Update active button
      document.querySelectorAll('.glasses-btn').forEach(btn => {
        console.log('Removing active from:', btn.textContent, btn.classList.contains('active'));
        btn.classList.remove('active');
      });
      button.classList.add('active');
      console.log('Set active on:', button.textContent);
      
      // Load new glasses model
      currentGlassesId = glasses.id;
      console.log('Updated currentGlassesId to:', currentGlassesId);
      loadGlassesModel(glasses.path);
      console.groupEnd();
    });
    
    glassesButtons.appendChild(button);
  });
  
  // Show the selector
  document.getElementById('glassesSelector').style.display = 'block';
}

function loadGlassesModel(glassesPath) {
  if (sceneManager && sceneManager.glasses) {
    const fullPath = `${PUBLIC_PATH}${glassesPath}`;
    sceneManager.glasses.loadGlasses(fullPath)
      .catch((error) => {
        console.error('Failed to load glasses model:', error);
      });
  } else {
    console.error('SceneManager or Glasses not available');
  }
}

async function main() {

  document.querySelector(".video-container").classList.add("loading");

  const canvas = document.querySelector('.output_canvas');

  const useOrtho = true;
  const debug = false;

  const onLandmarks = ({image, landmarks}) => {
    sceneManager.onLandmarks(image, landmarks);
  }

  const onFrame = async (video) => {
    try {
      await facemeshLandmarksProvider.send(video);
    } catch (e) {
      console.error("Camera not supported on your device:", e);
      cameraFrameProvider.stop();      
    }
  }

  function animate () {
    requestAnimationFrame(animate);
    sceneManager.resize(800, 500); // Default size, adjust if needed
    sceneManager.animate();
  }

  sceneManager = new SceneManager(canvas, debug, useOrtho);
  facemeshLandmarksProvider = new FacemeshLandmarksProvider(onLandmarks);

  // Create video element for camera
  const video = document.createElement("video");
  video.setAttribute("playsinline", "");
  video.style.display = "none"; // Hidden
  document.body.appendChild(video);
  
  // Use camera only (removed video file support)
  cameraFrameProvider = new CameraFrameProvider(video, onFrame);
  
  await facemeshLandmarksProvider.initialize();
  cameraFrameProvider.start();

  // Create glasses selector AFTER SceneManager is initialized
  createGlassesSelector();

  animate();

  document.querySelector(".video-container").classList.remove("loading");
}

main();
