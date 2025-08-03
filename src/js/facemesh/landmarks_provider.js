import { FaceMesh } from '@mediapipe/face_mesh';
import { PUBLIC_PATH } from '../public_path';
import { transformLandmarks } from './landmarks_helpers';

export class FacemeshLandmarksProvider {
  constructor(callback) {
    this.callback = callback;
    this.faceMesh = null;
  }

  send(image) {
    console.log('Envoi d\'image à MediaPipe:', {
      type: image.constructor.name,
      width: image.width,
      height: image.height,
      tagName: image.tagName
    });
    
    return this.faceMesh.send({image: image});
  }

  onResults({ image, multiFaceLandmarks }) {
    console.log('onResults appelé:', { 
      hasImage: image != null, 
      facesDetected: multiFaceLandmarks ? multiFaceLandmarks.length : 0 
    });
    
    if (image != null && multiFaceLandmarks != null && multiFaceLandmarks.length > 0) {
      const transformedLandmarks = transformLandmarks(multiFaceLandmarks[0]);
      console.log('Landmarks transformés, nombre de points:', transformedLandmarks ? transformedLandmarks.length : 0);
      
      this.callback({
        image: image,
        landmarks: transformedLandmarks
      });
    } else {
      console.log('Pas de visage détecté dans cette image');
      // Appeler le callback avec null pour indiquer qu'aucun visage n'a été détecté
      this.callback({
        image: image,
        landmarks: null
      });
    }
  }

  async initialize() {
    let onResults = this.onResults.bind(this);

    console.log('Initialisation de FaceMesh avec PUBLIC_PATH:', PUBLIC_PATH);
    
    this.faceMesh = new FaceMesh({locateFile: (file) => {
      let url =  `${PUBLIC_PATH}/mediapipe/${file}`;
      console.log('Chargement du fichier MediaPipe:', file, '-> URL:', url);
      return url
    }});
  
    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.3,
      minTrackingConfidence: 0.3,
      useCpuInference: false, // Utiliser GPU si disponible pour de meilleures performances
      selfieMode: false,
    });
  
    this.faceMesh.onResults(onResults);
  
    console.log('Initialisation de MediaPipe FaceMesh...');
    await this.faceMesh.initialize();
    console.log('MediaPipe FaceMesh initialisé avec succès');
  }
}