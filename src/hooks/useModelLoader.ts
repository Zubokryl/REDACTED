import { useState, useEffect } from 'react';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';

// Simple model cache
const modelCache = new Map<string, THREE.Group>();

/**
 * Custom hook for loading and caching 3D models
 */
export function useModelLoader(url: string) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!url) return;
    
    // Check cache first
    if (modelCache.has(url)) {
      const cachedModel = modelCache.get(url)!.clone();
      setModel(cachedModel);
      
      // Setup animation mixer if model has animations
      if (cachedModel.animations && cachedModel.animations.length > 0) {
        const newMixer = new THREE.AnimationMixer(cachedModel);
        cachedModel.animations.forEach((clip) => newMixer.clipAction(clip).play());
        setMixer(newMixer);
      }
      
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const loader = new FBXLoader();
    
    loader.load(
      url,
      (loaded) => {
        // Обработка материалов для предотвращения ошибок
        loaded.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            
            // Заменяем сложные материалы на простые
            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map(() => 
                new THREE.MeshPhongMaterial({ color: 0xcccccc })
              );
            } else {
              mesh.material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
            }
          }
        });
        
        // Center and scale the model
        centerAndScaleModel(loaded);
        
        // Save to cache
        modelCache.set(url, loaded.clone());
        
        setModel(loaded);
        
        // Setup animation mixer if model has animations
        if (loaded.animations && loaded.animations.length > 0) {
          const newMixer = new THREE.AnimationMixer(loaded);
          loaded.animations.forEach((clip) => newMixer.clipAction(clip).play());
          setMixer(newMixer);
        }
        
        setLoading(false);
      },
      (xhr) => {
        setProgress(Math.floor((xhr.loaded / xhr.total) * 100));
      },
      (err) => {
        console.error('Error loading model:', err);
        setError('Failed to load model');
        setLoading(false);
      }
    );
    
    return () => {
      // Cleanup - FBXLoader doesn't support cancellation
      if (mixer) {
        mixer.stopAllAction();
      }
    };
  }, [url]);

  return { model, mixer, loading, error, progress };
}

/**
 * Helper function to center and scale a 3D model
 */
export function centerAndScaleModel(model: THREE.Object3D, scale: number = 2.5) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  
  // Center the model
  model.position.x = -center.x;
  model.position.y = -center.y + (size.y / 2); // Adjust Y position to center vertically
  model.position.z = -center.z;
  
  // Scale the model to fit in view
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    const finalScale = scale / maxDim;
    model.scale.set(finalScale, finalScale, finalScale);
  }
  
  return model;
}