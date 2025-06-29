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
  const { scene, animations }: GLTFResult = useGLTF(url);
  const { actions }: { actions: THREE.AnimationAction[] } = useAnimations(animations, scene);

  useEffect(() => {
    Object.keys(actions).forEach((key) => {
      actions[key]?.play();
      });
}, [actions]);

  return <primitive object={scene} />;
}

// FBX
function ModelFBX({ url }) {
  const [object, setObject] = useState<THREE.Group | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    const loader = new FBXLoader();

    loader.load(url, (loaded) => {
      setObject(loaded);
      if (loaded.animations && loaded.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(loaded);
        loaded.animations.forEach((clip) => mixer.clipAction(clip).play()); 
        setMixer(mixer);
      }
    });

    return () => {
      mixer?.stopAllAction();
    };
  }, [url]);

  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
});

  useEffect(() => {
    return () => {
    if (object) {
      object.traverse((child) => {
        if ((child as Mesh).isMesh) {
          const mesh = child as Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m: THREE.Material) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
          mesh.parent?.remove(mesh);
        }
      });
    }
    };
  }, [object]);

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

        if (url.startsWith('http')) {
          const response = await fetch(url);
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
  return (
    <div className={styles.previewContainer}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={<Html center>Loading GLTF...</Html>}>
          <ModelGLTF url={url} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

if (isFBX) {
  return (
    <div className={styles.previewContainer}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={<Html center>Loading FBX...</Html>}>
          <ModelFBX url={url} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}


}