=============================================================================
                          SRC FOLDER DOCUMENTATION
=============================================================================

OVERVIEW:
---------
The src folder is the main source directory for the Virtual Glasses Try-On application.
It contains the entry points for both real-time video processing and static image 
processing modes of the application. This folder orchestrates the user interface,
camera integration, and coordinates between different components to provide an 
interactive glasses try-on experience.

FOLDER STRUCTURE:
----------------
- index.js: Main entry point for real-time video glasses try-on
- index.html: HTML template for the video interface
- static.html: HTML template for static image processing
- styles.css: Main CSS styles for the video interface
- static_styles.css: CSS styles for the static image interface
- js/: JavaScript modules and components
- 3d/: 3D models and related assets
- image-to-image/: Static image processing components

KEY FILES AND FUNCTIONS:
-----------------------

1. INDEX.JS (Real-time Video Interface):
   Purpose: Main application entry point for live camera glasses try-on
   
   Key Functions:
   - main(): Initializes the entire application
     * Sets up Three.js scene manager
     * Initializes MediaPipe face detection
     * Creates camera frame provider
     * Starts the animation loop
     * Creates glasses selection UI
   
   - createGlassesSelector(): Dynamically creates glasses selection buttons
     * Renders buttons for each available glasses model
     * Handles click events to switch glasses
     * Manages active button states
     * Triggers model loading when selection changes
   
   - loadGlassesModel(glassesPath): Loads and applies new glasses model
     * Constructs full path to glasses GLTF model
     * Calls SceneManager to load the new glasses
     * Handles loading errors gracefully
   
   - onLandmarks({image, landmarks}): Processes face detection results
     * Receives image frame and facial landmarks from MediaPipe
     * Passes data to SceneManager for 3D rendering
   
   - onFrame(video): Processes each video frame
     * Sends video frames to face detection
     * Handles camera errors and stops processing if needed
   
   - animate(): Main rendering loop
     * Uses requestAnimationFrame for smooth 60fps rendering
     * Resizes renderer and updates 3D scene
     * Continuously renders the scene

   Global Variables:
   - sceneManager: Manages 3D scene, camera, and rendering
   - facemeshLandmarksProvider: Handles face detection using MediaPipe
   - cameraFrameProvider: Manages camera access and video frames
   - availableGlasses: Array of glasses models with metadata
   - currentGlassesId: Tracks currently selected glasses model

2. INDEX.HTML:
   Purpose: Basic HTML structure for the video interface
   - Minimal HTML container with app div
   - JavaScript bundle injection point
   - Meta tags for responsive design

3. STATIC.HTML:
   Purpose: HTML structure for static image processing
   - Similar to index.html but for static image mode
   - Entry point for image upload interface

WORKFLOW:
---------
1. Application Initialization:
   - DOM content is injected via template string
   - Three.js SceneManager is created with canvas element
   - MediaPipe FaceMesh is initialized for face detection
   - Camera access is requested and video stream starts
   - Glasses selector UI is created after initialization

2. Real-time Processing Loop:
   - Camera captures video frames continuously
   - Each frame is sent to MediaPipe for face detection
   - When face is detected, landmarks are extracted
   - Landmarks are passed to 3D scene for glasses positioning
   - Three.js renders the scene with glasses overlay
   - Process repeats at 60fps via requestAnimationFrame

3. User Interaction:
   - User clicks glasses selection buttons
   - Button click triggers loadGlassesModel()
   - New 3D model is loaded and replaces current glasses
   - UI updates to show active selection
   - Glasses immediately appear on detected face

DEPENDENCIES:
------------
- Three.js: 3D graphics library for rendering glasses models
- MediaPipe: Google's face detection and landmark extraction
- WebGL: Hardware-accelerated graphics rendering
- WebRTC: Camera access via getUserMedia API
- ES6 Modules: Modern JavaScript module system
- CSS3: Styling and responsive layout

KEY LOGIC FLOWS:
---------------
1. Initialization Sequence:
   main() → SceneManager creation → MediaPipe init → Camera start → UI creation

2. Frame Processing:
   Camera frame → onFrame() → MediaPipe → onLandmarks() → 3D rendering

3. Glasses Selection:
   Button click → loadGlassesModel() → SceneManager.glasses.loadGlasses()

4. Rendering Loop:
   animate() → sceneManager.resize() → sceneManager.animate() → requestAnimationFrame

CONFIGURATION:
-------------
- useOrtho: true (Uses orthographic camera for consistent scaling)
- debug: false (Disables debug overlays)
- Default size: 800x500 pixels
- Default glasses: Grey (ID: 1)

TO REVIEW:
----------
1. Hard-coded available glasses array should be moved to external configuration
2. Magic numbers (800, 500) for default size should be constants
3. Console.group debug code in createGlassesSelector could be removed for production
4. Error handling in main() could be more robust with try-catch blocks
5. Global variables could be encapsulated in a class or module
6. No validation for camera permissions or WebGL support
7. Animation loop runs regardless of whether face is detected (performance consideration)
