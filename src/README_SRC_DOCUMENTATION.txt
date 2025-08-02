================================================================================
                              SRC FOLDER DOCUMENTATION
                            Main Source Code Directory
================================================================================

OVERVIEW:
---------
The src/ directory contains all the application source code, including the main
entry point, HTML template, styling, and organized subdirectories for different
functionality areas.

FILES IN THIS DIRECTORY:
------------------------

1. index.html
   - Purpose: Basic HTML template for the application
   - Content: Minimal structure with a single div container (#app)
   - Role: Serves as the foundation where JavaScript dynamically creates the UI

2. index.js
   - Purpose: Main application entry point and orchestrator
   - Functionality:
     * Imports all necessary modules and dependencies
     * Creates the main UI template with video container and canvas
     * Initializes core components (SceneManager, FacemeshLandmarksProvider)
     * Handles user choice between camera and video input
     * Sets up the main animation loop
     * Coordinates data flow between face detection and 3D rendering
   - Key Features:
     * Async initialization of MediaPipe models
     * Error handling for unsupported devices
     * Responsive canvas sizing (800x500 default)

3. styles.css
   - Purpose: Application styling and layout
   - Scope: Global styles for the user interface
   - Features: Responsive design, loading states, video container styling

SUBDIRECTORIES:
---------------
- 3d/ - Contains 3D model assets (GLTF files and textures)
- js/ - Core JavaScript modules organized by functionality
- video/ - Sample video files for testing and demo purposes

DATA FLOW:
----------
index.js orchestrates the entire application:
1. User selects input source (camera or video)
2. Video frames are captured and sent to MediaPipe
3. Face landmarks are detected and processed
4. 3D scene is updated with new landmark data
5. Glasses are positioned and rendered on the face
6. Animation loop continues for real-time updates

ARCHITECTURE PATTERN:
--------------------
The src/ directory follows a modular architecture:
- Single entry point (index.js) for coordination
- Separated concerns with dedicated subdirectories
- Event-driven communication between components
- Asynchronous initialization for better user experience

REVIEW:
-------
The src/ directory is well-organized with clear separation of concerns. The main
index.js file effectively orchestrates the complex interaction between computer
vision and 3D graphics without becoming overly complex. The modular structure
makes the codebase maintainable and extensible. The async/await pattern ensures
smooth initialization, and error handling provides good user feedback for
unsupported scenarios.
