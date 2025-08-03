================================================================================
                           PROJECT DOCUMENTATION
                          Mediapipe Facemesh Effects
================================================================================

OVERVIEW:
---------
This is a real-time facemesh effects application that uses MediaPipe for face 
detection and Three.js for 3D rendering to overlay virtual glasses on faces. 
The application works with both camera input and video files, providing AR-like 
effects in web browsers.

PROJECT STRUCTURE:
------------------
- Root level configuration files (package.json, webpack.config.js, README.md)
- src/ - Source code directory containing all application logic
- 3d/Models/ - 3D model assets for glasses organized by model type
- js/ - JavaScript modules for core functionality

TECHNOLOGY STACK:
-----------------
- MediaPipe: Face mesh detection and landmark tracking
- Three.js: 3D graphics rendering and scene management
- Webpack: Module bundling and development server
- Babel: JavaScript transpilation for browser compatibility

KEY FEATURES:
-------------
1. Real-time face detection using MediaPipe
2. 3D glasses overlay with accurate positioning and rotation
3. Camera input for live face tracking
4. Responsive canvas rendering
5. Optimized for performance on older hardware

BUILD SYSTEM:
-------------
- Development server: npm run serve (webpack-dev-server)
- Development build: npm run build-dev
- Production build: npm run build-prod

DEPENDENCIES:
-------------
Core Libraries:
- @mediapipe/face_mesh: Face detection and landmark extraction
- three: 3D graphics library
- @mediapipe/camera_utils: Camera handling utilities

Development Tools:
- webpack: Module bundler
- babel: JavaScript compiler
- css-loader, style-loader: CSS processing

LIMITATIONS:
------------
- Face Transform Module not available in JavaScript MediaPipe
- Limited depth information affects 3D perspective accuracy
- Performance depends on device capabilities

REVIEW:
-------
This is a well-structured AR application that demonstrates modern web technologies
for computer vision and 3D graphics. The code is modular and follows good separation
of concerns. The use of MediaPipe ensures robust face detection, while Three.js
provides smooth 3D rendering. The project successfully bridges computer vision
and web graphics, making it an excellent example of browser-based AR applications.

The architecture is scalable and could easily be extended with additional face
effects or different 3D models. The performance optimization considerations show
thoughtful development for real-world deployment.
