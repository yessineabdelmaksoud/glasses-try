=============================================================================
                          JS FOLDER DOCUMENTATION
=============================================================================

OVERVIEW:
---------
The js folder contains core JavaScript utility modules and components that 
provide essential functionality for the glasses try-on application. This folder
serves as the foundation layer, providing camera access, path configuration,
and organizing specialized components for face detection and 3D rendering.

FOLDER STRUCTURE:
----------------
- camera_frame_provider.js: Camera access and video frame management
- public_path.js: Build system path configuration utility
- facemesh/: Face detection and landmark processing components
- three_components/: 3D graphics and rendering components

KEY FILES AND CLASSES:
---------------------

1. CAMERA_FRAME_PROVIDER.JS:
   Purpose: Manages camera access and video frame streaming using MediaPipe Camera utility
   
   Class: CameraFrameProvider
   Constructor Parameters:
   - videoElement: HTML video element to receive camera stream
   - onFrame: Callback function called for each video frame
   
   Key Methods:
   - constructor(): Initializes MediaPipe Camera with configuration
     * Sets up camera with 1280x720 resolution
     * Configures onFrame callback to process each frame
     * Creates camera instance with specified video element
   
   - start(): Begins camera capture and frame streaming
     * Requests camera permissions if not already granted
     * Starts video stream to the provided video element
     * Begins calling onFrame callback for each frame
   
   - stop(): Halts camera capture and streaming
     * Stops the camera stream
     * Releases camera resources
     * Stops frame processing callbacks
   
   Configuration:
   - Default resolution: 1280x720 (720p HD)
   - Frame rate: Controlled by camera capability (typically 30fps)
   - Uses MediaPipe Camera utility for cross-platform compatibility

2. PUBLIC_PATH.JS:
   Purpose: Provides build system path configuration for asset loading
   
   Export: PUBLIC_PATH constant
   - Retrieves webpack public path configuration
   - Removes trailing slash for consistent path joining
   - Fallback to empty string if webpack path unavailable
   - Used for constructing URLs to 3D models and assets
   
   Usage Pattern:
   - Import: `import { PUBLIC_PATH } from './public_path'`
   - Usage: `const fullPath = PUBLIC_PATH + '/models/glasses.gltf'`

DEPENDENCIES:
------------
- @mediapipe/camera_utils: MediaPipe camera access utilities
- Webpack: Build system for public path resolution
- WebRTC getUserMedia: Browser camera access API
- MediaDevices API: Device enumeration and constraints

KEY LOGIC FLOWS:
---------------
1. Camera Initialization:
   CameraFrameProvider creation → MediaPipe Camera setup → Video element binding

2. Frame Processing Pipeline:
   Camera capture → MediaPipe processing → onFrame callback → Application processing

3. Path Resolution:
   Webpack build → PUBLIC_PATH export → Asset URL construction

TECHNICAL DETAILS:
-----------------
1. Camera Configuration:
   - Resolution optimized for face detection accuracy vs performance
   - 720p provides good detail for landmark detection
   - Frame rate depends on device capability
   - Automatic camera selection (front camera preferred)

2. Path Management:
   - Webpack public path ensures assets load correctly in all deployment scenarios
   - Handles both development and production builds
   - Supports CDN deployment and subdirectory hosting

ERROR HANDLING:
--------------
1. Camera Access:
   - Permissions denied: Handled by MediaPipe Camera utility
   - No camera available: Graceful degradation needed at application level
   - Camera in use: MediaPipe handles resource conflicts

2. Path Resolution:
   - Missing webpack config: Falls back to empty string
   - Invalid paths: Application level validation required

PERFORMANCE CONSIDERATIONS:
--------------------------
1. Camera Resolution:
   - 720p chosen as balance between quality and performance
   - Higher resolution increases face detection accuracy
   - Lower resolution improves frame rate and reduces CPU usage

2. Frame Processing:
   - Each frame triggers onFrame callback
   - Callback should be efficient to maintain smooth video
   - Consider frame skipping for performance on slower devices

BROWSER COMPATIBILITY:
---------------------
- Requires WebRTC support (all modern browsers)
- MediaPipe Camera utility handles cross-browser differences
- Fallback needed for browsers without camera access

SECURITY CONSIDERATIONS:
-----------------------
- Camera access requires user permission
- HTTPS required for camera access in production
- No video data is stored or transmitted (local processing only)

TO REVIEW:
----------
1. Hard-coded camera resolution (1280x720) should be configurable
2. No error handling for camera initialization failures
3. PUBLIC_PATH fallback might need environment-specific defaults
4. Missing video_frame_provider.js file referenced in project structure
5. Camera configuration could support device selection (front/back camera)
6. Frame rate optimization could be added based on device performance
7. No graceful handling of camera permissions denied scenario
8. Missing validation for video element parameter in constructor
