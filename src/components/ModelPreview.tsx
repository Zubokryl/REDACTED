'use client';

import { useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import styles from './ModelPreview.module.css';

interface ModelPreviewProps {
  url: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ModelPreview({ url }: ModelPreviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Skip check for blob URLs
        if (url.startsWith('blob:')) {
          setIsLoading(false);
          return;
        }

        // For server URLs, check if file exists
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

  return (
    <div className={styles.previewContainer}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model url={url} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}