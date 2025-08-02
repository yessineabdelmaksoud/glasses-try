================================================================================
                             VIDEO FOLDER DOCUMENTATION
                           Sample Video Assets Directory
================================================================================

OVERVIEW:
---------
The video/ directory contains sample video files used for testing and demonstration
of the face detection and glasses overlay functionality. These videos provide
alternative input sources when camera access is not available or desired.

FILES IN THIS DIRECTORY:
------------------------

1. videoplayback.mp4
   - Purpose: Primary test video for face detection demonstration
   - Format: MP4 (widely supported video format)
   - Usage: Selected when user chooses video input over camera
   - Contains: Likely contains human faces for testing face detection
   - Optimization: Compressed for web delivery

2. videoplayback2.mp4
   - Purpose: Secondary test video (currently used as default in index.js)
   - Format: MP4 (web-optimized)
   - Usage: Default video loaded when camera option is declined
   - Application: Currently referenced in the main application logic
   - Contains: Face content suitable for landmark detection

VIDEO REQUIREMENTS:
-------------------
For optimal face detection performance, videos should have:
- Clear, well-lit faces
- Frontal or near-frontal face angles
- Sufficient resolution for landmark detection
- Stable camera movement (not too shaky)
- Good contrast between face and background
- Multiple face positions/angles for comprehensive testing

TECHNICAL SPECIFICATIONS:
-------------------------
- Format: MP4 (H.264 codec recommended)
- Resolution: Should match or be adaptable to canvas dimensions
- Frame Rate: 30fps or lower for smooth processing
- Compression: Balanced for quality vs. file size
- Duration: Long enough for comprehensive testing
- Audio: Not required (application focuses on visual processing)

INTEGRATION WITH APPLICATION:
-----------------------------
- Loading: Handled by VideoFrameProvider class
- Processing: Frame-by-frame analysis through MediaPipe
- Playback: Controlled programmatically (not user-visible)
- Looping: Can be configured for continuous testing
- Error Handling: Fallback mechanisms for loading failures

USAGE PATTERNS:
---------------
1. Development Testing: Quick testing without camera setup
2. Demo Purposes: Reliable content for presentations
3. Algorithm Testing: Consistent input for debugging face detection
4. Performance Testing: Measuring processing speed with known content
5. Cross-browser Testing: Ensuring compatibility across different browsers

ADDING NEW VIDEOS:
------------------
To add new test videos:
1. Place MP4 files in the video/ directory
2. Update references in index.js or VideoFrameProvider
3. Ensure videos contain clear faces for detection
4. Test with various lighting conditions and face angles
5. Optimize file size for web delivery

PERFORMANCE CONSIDERATIONS:
---------------------------
- File size impacts loading time
- Resolution affects processing performance
- Frame rate should match application needs
- Video codec compatibility across browsers
- Network bandwidth considerations for remote loading

CONTENT GUIDELINES:
-------------------
- Include diverse face types and angles
- Ensure good lighting conditions
- Avoid extreme camera movements
- Include both single and multiple face scenarios
- Consider privacy and consent for any recorded content

REVIEW:
-------
The video/ directory serves as a practical testing and demonstration resource
for the face detection system. Having multiple video options allows for
comprehensive testing of different scenarios without requiring live camera
access. The MP4 format choice is appropriate for web compatibility and broad
browser support.

The presence of two videos suggests thoughtful consideration of different test
cases, though more documentation about their specific content and intended use
cases would be beneficial. The directory structure is simple and functional,
making it easy to add additional test content as needed.

For a production system, this directory provides essential assets for quality
assurance, demonstration purposes, and development workflows. The videos
serve as reliable, consistent input sources that enable reproducible testing
of the face detection and overlay algorithms.
