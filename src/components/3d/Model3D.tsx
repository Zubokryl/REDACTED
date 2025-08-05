import React, { memo } from 'react';
import { useGLTF, useAnimations, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useModelLoader, centerAndScaleModel } from '@/hooks/useModelLoader';
import styles from './ModelScene.module.css';

interface Model3DProps {
  url: string;
  animate?: boolean;
}

/**
 * GLTF Model Component
 */
const GLTFModel = memo(({ url }: { url: string }) => {
  const { scene, animations } = useGLTF(url, true);
  const { actions } = useAnimations(animations, scene);
  
  React.useEffect(() => {
    // Center and scale the model
    centerAndScaleModel(scene);
    
    // Play animations if available
    if (actions) {
      Object.keys(actions).forEach((key) => {
        actions[key]?.play();
      });
    }
    
    // Cleanup on unmount
    return () => {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m: THREE.Material) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
    };
  }, [scene, actions]);

  return <primitive object={scene} />;
});

/**
 * FBX Model Component
 */
const FBXModel = memo(({ url }: { url: string }) => {
  const { model, mixer, loading, error } = useModelLoader(url);
  const groupRef = React.useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    // Update animations
    if (mixer) {
      mixer.update(delta);
    }
    
    // Gentle floating animation - removed to ensure proper positioning
    // We'll let the centerAndScaleModel function handle positioning
  });
  
  if (error) {
    return <Html center><div className={styles.errorText}>{error}</div></Html>;
  }
  
  if (loading) {
    return <Html center><div className={styles.loadingText}>Loading FBX Model...</div></Html>;
  }
  
  return model ? <primitive ref={groupRef} object={model} /> : null;
});

/**
 * Generic 3D Model component that handles different file formats
 */
const Model3D: React.FC<Model3DProps> = ({ url, animate = true }) => {
  const isGLTF = url.toLowerCase().endsWith('.gltf') || url.toLowerCase().endsWith('.glb');
  const isFBX = url.toLowerCase().endsWith('.fbx');
  
  if (isGLTF) {
    return <GLTFModel url={url} />;
  }
  
  if (isFBX) {
    return <FBXModel url={url} />;
  }
  
  return null;
};

export default memo(Model3D);