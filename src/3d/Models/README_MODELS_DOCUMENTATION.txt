================================================================================
                            MODELS FOLDER DOCUMENTATION
                           3D Glasses Models Organization
================================================================================

OVERVIEW:
---------
The Models/ directory contains all 3D glasses models organized by type and color.
Each glasses style is in its own subdirectory, and each color variant has its own
folder containing all required assets (GLTF files, textures, and binary data).

CURRENT MODELS:
---------------

glasses/
├── black/
│   - Black colored glasses with textures
│   - Contains model files and color-specific textures
├── brown/
│   - Brown colored glasses variant
│   - Contains model files and color-specific textures
└── grey/
    - Grey colored glasses variant
    - Contains model files and color-specific textures

FOLDER STRUCTURE PER COLOR:
---------------------------
Each color folder should contain:
- [color].gltf (main model file for that color)
- [color].bin (binary geometry data, if used)
- Image_0.jpg, Image_1.png (color-specific texture files)

USAGE IN CODE:
--------------
Models are loaded in glasses.js using:
`${PUBLIC_PATH}/3d/Models/glasses/[color]/[color].gltf`

Current default: grey glasses

ADDING NEW COLORS:
------------------
1. Create new folder: Models/glasses/[color-name]/
2. Add color-specific GLTF files and textures
3. Update glasses.js to reference the new color
4. Test functionality and appearance

NAMING CONVENTIONS:
-------------------
- Use lowercase with hyphens: "round-glasses", "sport-glasses"
- Be descriptive: indicate style, color, or distinctive features
- Keep names short but meaningful

PERFORMANCE CONSIDERATIONS:
---------------------------
- Models with textures load slower but look more realistic
- Models with only solid colors load faster
- Consider file sizes for web deployment
- Test on various devices for compatibility

MODEL REQUIREMENTS:
-------------------
- Front-facing orientation (important for landmark alignment)
- Appropriate scale for average human faces
- Clean geometry with proper normals
- Valid GLTF 2.0 format

REVIEW:
-------
The Models/ folder provides excellent organization for managing multiple glasses
styles. This structure makes it easy to add new models, compare different styles,
and maintain clean separation between different glasses types. The organization
supports both textured and non-textured models, allowing for flexibility in
choosing between visual quality and performance.
