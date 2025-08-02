================================================================================
                              JS FOLDER DOCUMENTATION
                           Core JavaScript Modules Directory
================================================================================

OVERVIEW:
---------
The js/ directory contains the core application logic organized into modular
components. Each file handles a specific aspect of the application, from camera
input to 3D rendering, following the single responsibility principle.

FILES IN THIS DIRECTORY:
------------------------

1. camera_frame_provider.js
   - Purpose: Handles real-time camera input for face detection
   - Class: CameraFrameProvider
   - Functionality:
     * Wraps MediaPipe Camera utility for video capture
     * Configures camera settings (1280x720 resolution)
     * Provides start/stop controls for camera stream
     * Calls onFrame callback for each captured frame
   - Dependencies: @mediapipe/camera_utils

2. video_frame_provider.js
   - Purpose: Handles video file input as alternative to camera
   - Class: VideoFrameProvider
   - Functionality:
     * Manages video element playback
     * Provides frame-by-frame processing capability
     * Implements same interface as CameraFrameProvider
     * Supports start/stop controls for consistent API

3. public_path.js
   - Purpose: Centralized path configuration for assets
   - Exports: PUBLIC_PATH constant
   - Usage: Used throughout the app for loading models and MediaPipe files
   - Benefit: Easy deployment path management

SUBDIRECTORIES:
---------------

facemesh/ - Face detection and landmark processing modules
three_components/ - 3D graphics and rendering components

ARCHITECTURE PATTERN:
--------------------
- Provider Pattern: CameraFrameProvider and VideoFrameProvider implement 
  the same interface, allowing seamless switching between input sources
- Facade Pattern: Simplifies complex MediaPipe camera setup
- Configuration Pattern: Centralized path management
- Dependency Injection: Components receive callbacks rather than hard dependencies

DATA FLOW:
----------
1. Frame providers capture video data (camera or file)
2. Frames are passed to the main application via callbacks
3. Main app forwards frames to face detection pipeline
4. Results flow back through the callback chain
5. 3D components receive processed landmark data

DESIGN BENEFITS:
----------------
- Interchangeable input sources without code changes
- Clean separation between input handling and processing
- Consistent error handling across different input types
- Easy testing with mock providers

REVIEW:
-------
The js/ directory demonstrates excellent modular design with clear interfaces
and responsibilities. The provider pattern implementation allows for flexible
input sources while maintaining consistent behavior. The code is clean, focused,
and follows modern JavaScript practices. The separation of concerns makes the
system easily testable and maintainable. Each module has a single, well-defined
purpose, contributing to the overall system's robustness and extensibility.
