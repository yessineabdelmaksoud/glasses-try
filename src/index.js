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
`;

document.querySelector("#app").innerHTML = template;

async function main() {

  document.querySelector(".video-container").classList.add("loading");

  const canvas = document.querySelector('.output_canvas');

  const useOrtho = true;
  const debug = false;

  let sceneManager;
  let facemeshLandmarksProvider;
  let cameraFrameProvider;

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

  animate();

  document.querySelector(".video-container").classList.remove("loading");
}

main();
