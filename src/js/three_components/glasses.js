
import * as THREE from 'three';
import { PUBLIC_PATH } from '../public_path';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { scaleLandmark } from '../facemesh/landmarks_helpers';

function loadModel( file ) {
  return new Promise( ( res, rej ) => {
      const loader = new GLTFLoader();
      loader.load( file, function ( gltf ) {
        res( gltf.scene );
      }, undefined, function ( error ) {
          rej( error );
      } );
  });
}

export class Glasses {
  constructor(scene, width, height) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.needsUpdate = false;
    this.landmarks = null;
    this.loadGlasses();
  }

  async loadGlasses(path) {
    // Use the provided path, or fall back to a default model for features like the static image processor.
    const modelPath = path || `${PUBLIC_PATH}/3d/Models/glasses/grey/grey.gltf`;

    // If glasses are already in the scene, remove them before loading a new one
    if (this.glasses) {
      this.scene.remove(this.glasses);
    }
    
    this.glasses = await loadModel(modelPath);
    console.log('[Glasses] Model loaded:', modelPath);

    // scale glasses
    const bbox = new THREE.Box3().setFromObject(this.glasses);
    const size = bbox.getSize(new THREE.Vector3());
    this.scaleFactor = size.x;

    this.glasses.name = 'glasses';

    // If landmarks are already present, trigger update
    if (this.landmarks) {
      console.log('[Glasses] Landmarks already present, updating glasses after model load.');
      this.needsUpdate = true;
      this.update();
    }
  }

  updateDimensions(width, height) {
    this.width = width;
    this.height = height;
    this.needsUpdate = true;
  }

  updateLandmarks(landmarks) {
    this.landmarks = landmarks;
    this.needsUpdate = true;
    // If glasses model is loaded, update immediately
    if (this.glasses) {
      this.update();
    } else {
      console.log('[Glasses] Model not loaded yet, will update after load.');
    }
  }

  updateGlasses() {
    // Points for reference
    // https://raw.githubusercontent.com/google/mediapipe/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png

    let midEyes = scaleLandmark(this.landmarks[168], this.width, this.height);
    let leftEyeInnerCorner = scaleLandmark(this.landmarks[463], this.width, this.height);
    let rightEyeInnerCorner = scaleLandmark(this.landmarks[243], this.width, this.height);
    let noseBottom = scaleLandmark(this.landmarks[2], this.width, this.height);
    
    // These points seem appropriate 446, 265, 372, 264
    let leftEyeUpper1 = scaleLandmark(this.landmarks[264], this.width, this.height);
    // These points seem appropriate 226, 35, 143, 34
    let rightEyeUpper1 = scaleLandmark(this.landmarks[34], this.width, this.height);

    if (this.glasses) {
  
      // position
      this.glasses.position.set(
        midEyes.x,
        midEyes.y,
        midEyes.z,
      )

      // scale to make glasses
      // as wide as distance between
      // left eye corner and right eye corner
      const eyeDist = Math.sqrt(
        ( leftEyeUpper1.x - rightEyeUpper1.x ) ** 2 +
        ( leftEyeUpper1.y - rightEyeUpper1.y ) ** 2 +
        ( leftEyeUpper1.z - rightEyeUpper1.z ) ** 2
      );
      const scale = eyeDist / this.scaleFactor;
      this.glasses.scale.set(scale, scale, scale);

      // use two vectors to rotate glasses
      // Vertical Vector from midEyes to noseBottom
      // is used for calculating rotation around x and z axis
      // Horizontal Vector from leftEyeCorner to rightEyeCorner
      // us use to calculate rotation around y axis
      let upVector = new THREE.Vector3(
        midEyes.x - noseBottom.x,
        midEyes.y - noseBottom.y,
        midEyes.z - noseBottom.z,
      ).normalize();

      let sideVector = new THREE.Vector3(
        leftEyeInnerCorner.x - rightEyeInnerCorner.x,
        leftEyeInnerCorner.y - rightEyeInnerCorner.y,
        leftEyeInnerCorner.z - rightEyeInnerCorner.z,
      ).normalize();

      let zRot = (new THREE.Vector3(1, 0, 0)).angleTo(
        upVector.clone().projectOnPlane(
          new THREE.Vector3(0, 0, 1)
        )
      ) - (Math.PI / 2)

      let xRot = (Math.PI / 2) - (new THREE.Vector3(0, 0, 1)).angleTo(
        upVector.clone().projectOnPlane(
          new THREE.Vector3(1, 0, 0)
        )
      );

      let yRot =  (
        new THREE.Vector3(sideVector.x, 0, sideVector.z)
      ).angleTo(new THREE.Vector3(0, 0, 1)) - (Math.PI / 2);
      
      this.glasses.rotation.set(xRot, yRot, zRot);

    }
  }

  addGlasses() {
    if (this.glasses) {
      this.scene.add(this.glasses);
    }
  }

  removeGlasses() {
    this.scene.remove(this.glasses);
  }

  update() {
    if (this.needsUpdate) {
      let inScene = !!this.scene.getObjectByName('glasses');
      let shouldShow = !!this.landmarks;
      if (inScene) {
        shouldShow ? this.updateGlasses() : this.removeGlasses();
      } else {
        if (shouldShow) {
          this.addGlasses();
        }
      }
    }
  }
}