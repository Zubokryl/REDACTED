'use client';

import { useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useAnimations } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import { Suspense, useEffect, useState } from 'react';
import { Mesh } from 'three';
import { Html } from '@react-three/drei';
import { Object3DEventMap } from 'three';
import styles from './ModelPreview.module.css';


interface ModelPreviewProps {
  url: string;
}

interface GLTFResult {
  scene: THREE.Group<Object3DEventMap>;
  animations: THREE.AnimationClip[];
}

// GLTF
function ModelGLTF({ url }: { url: string }) {
  const { scene, animations }: GLTFResult = useGLTF(url, true); // Добавляем параметр draco=true
  const { actions }: { actions: THREE.AnimationAction[] } = useAnimations(animations, scene);

  useEffect(() => {
    // Center the model
    scene.position.set(0, 0, 0);
    
    // Slightly elevate the model to avoid appearing on a "floor"
    scene.position.y += 0.2;
    
    // Scale the model to fit in view
    scene.scale.set(3.0, 3.0, 3.0);
    
    // Play animations if available
    if (actions) {
      Object.keys(actions).forEach((key) => {
        actions[key]?.play();
      });
    }
  }, [scene, actions]);

  return <primitive object={scene} scale={1.0} />;
}

// FBX
function ModelFBX({ url }) {
  const [object, setObject] = useState<THREE.Group | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Loading FBX model from URL:', url);
    setLoading(true);
    setError(null);
    
    // Fix URL if it contains a double URL pattern
    let fixedUrl = url;
    if (url.includes('http://localhost:8000/storage/models/http://localhost:8000/api/models/file/')) {
      fixedUrl = url.replace('http://localhost:8000/storage/models/', '');
      console.log('Fixed URL:', fixedUrl);
    }
    
    const loader = new FBXLoader();

    loader.load(
      fixedUrl, 
      (loaded) => {
        console.log('FBX model loaded successfully');
        
        // Center the model properly
        const box = new THREE.Box3().setFromObject(loaded);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        loaded.position.x = -center.x;
        loaded.position.y = -center.y;
        loaded.position.z = -center.z;
        
        // Scale the model to fit in view optimally
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const scale = 2.0 / maxDim; // Slightly smaller scale
          loaded.scale.set(scale, scale, scale);
        }
        
        // Simplify materials to prevent WebGL context loss
        loaded.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            
            // Replace complex materials with simple ones
            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map(() => 
                new THREE.MeshPhongMaterial({ color: 0xcccccc })
              );
            } else {
              mesh.material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
            }
          }
        });
        
        setObject(loaded);
        if (loaded.animations && loaded.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(loaded);
          loaded.animations.forEach((clip) => mixer.clipAction(clip).play()); 
          setMixer(mixer);
        }
        setLoading(false);
      },
      // Progress
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      // Error
      (err) => {
        console.error('Error loading FBX:', err);
        setError('Failed to load FBX model');
        setLoading(false);
      }
    );

    return () => {
      mixer?.stopAllAction();
      // Clean up resources
      if (object) {
        object.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry?.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(m => m.dispose());
            } else if (mesh.material) {
              mesh.material.dispose();
            }
          }
        });
      }
    };
  }, [url]);

  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
    // No artificial movement for static models
  });

  // Removed problematic cleanup code that was causing errors

  if (error) {
    return <Html center><div className={styles.errorText}>{error}</div></Html>;
  }

  if (loading) {
    return <Html center><div className={styles.loadingText}>Loading FBX Model...</div></Html>;
  }

  return object ? <primitive object={object} /> : null;
}

export default function ModelPreview({ url }: ModelPreviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isVideo = url?.toLowerCase().endsWith('.mp4');
  const isFBX = url?.toLowerCase().endsWith('.fbx');
  const isGLTF =
    url?.toLowerCase().endsWith('.gltf') || url?.toLowerCase().endsWith('.glb');

  useEffect(() => {
    const checkFile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (url.startsWith('blob:')) {
          setIsLoading(false);
          return;
        }
        
        // Skip check for API URLs to avoid CORS issues
        if (url.includes('api/models/file') || url.includes('http://localhost:8000/api/models/file/')) {
          setIsLoading(false);
          return;
        }

        if (url.startsWith('http')) {
          // Use HEAD request instead of GET to avoid downloading the entire file
          const response = await fetch(url, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error checking file:', err);
        setError(err instanceof Error ? err.message : 'Failed to load model');
        setIsLoading(false);
      }
    };

    checkFile();
    
    // Очистка URL при размонтировании компонента
    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.loadingMessage}>Loading model...</p>
      </div>
    );
  }

  if (isVideo) {
    return <video src={url} controls style={{ width: '100%', height: 'auto' }} />;
  }

  if (isGLTF) {
  console.log('Rendering GLTF model with URL:', url);
  return (
    <div className={styles.previewContainer}>
      <Canvas camera={{ position: [0, 0, 2.5], fov: 40 }} onCreated={({gl}) => {
          gl.setClearColor("#1a1a1a");
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lower pixel ratio
          gl.physicallyCorrectLights = true;
        }}>
        <color attach="background" args={["#1a1a1a"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <Suspense fallback={<Html center><div className={styles.loadingText}>Loading 3D Model...</div></Html>}>
          <ModelGLTF url={url} />
        </Suspense>
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true} 
          autoRotate={true} 
          autoRotateSpeed={0.3} 
          enableDamping={false} // Disable damping
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 6}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}

if (isFBX) {
  console.log('Rendering FBX model with URL:', url);
  return (
    <div className={styles.previewContainer}>
      <Canvas camera={{ position: [0, 0, 2.5], fov: 40 }} onCreated={({gl}) => {
          gl.setClearColor("#1a1a1a");
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lower pixel ratio
          gl.physicallyCorrectLights = true;
        }}>
        <color attach="background" args={["#1a1a1a"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <Suspense fallback={<Html center><div className={styles.loadingText}>Loading 3D Model...</div></Html>}>
          <ModelFBX url={url} />
        </Suspense>
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true} 
          autoRotate={true} 
          autoRotateSpeed={0.3} 
          enableDamping={false} // Disable damping
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 6}
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}


}