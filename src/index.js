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

<div id="debugPanel" style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 12px; z-index: 2000; max-width: 300px; display: none;">
  <h4 style="margin: 0 0 10px 0;">🔧 Debug Info</h4>
  <div id="debugContent">Loading...</div>
  <button onclick="document.getElementById('debugPanel').style.display='none'" style="margin-top: 10px; padding: 5px;">Hide</button>
</div>

<button onclick="document.getElementById('debugPanel').style.display='block'" style="position: fixed; top: 10px; right: 10px; z-index: 1999; background: #007bff; color: white; border: none; padding: 10px; border-radius: 5px;">🔧 Debug</button>
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

// Validate model paths on startup
console.group('🔍 Model Path Validation');
availableGlasses.forEach(glasses => {
  const fullPath = `${PUBLIC_PATH}${glasses.path}`;
  console.log(`${glasses.name} (ID: ${glasses.id}):`, fullPath);
  
  // Try to fetch the model to see if it exists
  fetch(fullPath, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        console.log(`✅ ${glasses.name} model exists`);
      } else {
        console.warn(`⚠️ ${glasses.name} model might not exist (${response.status})`);
      }
    })
    .catch(() => {
      console.error(`❌ ${glasses.name} model path unreachable`);
    });
});
console.groupEnd();

function updateDebugPanel() {
  const debugContent = document.getElementById('debugContent');
  if (!debugContent) return;
  
  console.log('🔧 Debug Panel Update - SceneManager status:', !!sceneManager);
  
  const glassesInScene = sceneManager?.scene?.getObjectByName('glasses');
  const debugInfo = {
    'Current Glasses ID': currentGlassesId,
    'SceneManager': !!sceneManager,
    'Glasses Object': !!(sceneManager?.glasses),
    'Glasses in Scene': !!glassesInScene,
    'Scene Children': sceneManager?.scene?.children?.length || 0,
    'PUBLIC_PATH': PUBLIC_PATH,
    'Landmarks Present': !!(sceneManager?.glasses?.landmarks),
    'Last Model Path': sceneManager?.glasses?.lastLoadedPath || 'None'
  };
  
  let html = '';
  for (const [key, value] of Object.entries(debugInfo)) {
    const color = typeof value === 'boolean' ? (value ? '#4CAF50' : '#F44336') : '#FFF';
    html += `<div style="margin: 2px 0;"><strong>${key}:</strong> <span style="color: ${color}">${value}</span></div>`;
  }
  
  debugContent.innerHTML = html;
}

// Update debug panel every 2 seconds
setInterval(updateDebugPanel, 2000);

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
  console.group('🕶️ Loading Glasses Model');
  console.log('Requested path:', glassesPath);
  console.log('SceneManager exists:', !!sceneManager);
  console.log('Glasses object exists:', !!(sceneManager && sceneManager.glasses));
  
  if (sceneManager && sceneManager.glasses) {
    const fullPath = `${PUBLIC_PATH}${glassesPath}`;
    console.log('Full model path:', fullPath);
    console.log('Current glasses in scene before load:', sceneManager.scene.getObjectByName('glasses'));
    
    // Add a promise to track loading completion
    sceneManager.glasses.loadGlasses(fullPath)
      .then(() => {
        console.log('✅ Glasses model loaded successfully');
        console.log('New glasses in scene:', sceneManager.scene.getObjectByName('glasses'));
        console.log('Scene children count:', sceneManager.scene.children.length);
      })
      .catch((error) => {
        console.error('❌ Failed to load glasses model:', error);
      });
  } else {
    console.error('❌ SceneManager or Glasses not available');
    console.log('SceneManager:', sceneManager);
    console.log('Glasses:', sceneManager?.glasses);
  }
  console.groupEnd();
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
  console.log('🎬 SceneManager created:', !!sceneManager);
  
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
  console.log('🎬 SceneManager initialized, creating glasses selector...');
  createGlassesSelector();
  
  // Add scene monitoring for debugging
  setInterval(() => {
    if (sceneManager && sceneManager.scene) {
      const glassesInScene = sceneManager.scene.getObjectByName('glasses');
      console.log('🎭 Scene Monitor:', {
        totalChildren: sceneManager.scene.children.length,
        glassesPresent: !!glassesInScene,
        glassesType: glassesInScene?.type,
        currentGlassesId: currentGlassesId
      });
    }
  }, 5000); // Log every 5 seconds

  animate();

  document.querySelector(".video-container").classList.remove("loading");
}

main();
