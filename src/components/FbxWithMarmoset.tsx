'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { findTbsceneFile, findTextureFiles } from '@/utils/modelUtils';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { Suspense } from 'react';
import styles from './ModelDetailPreview.module.css';

interface FbxWithMarmosetProps {
  url: string;
  ModelFBX: React.ComponentType<{ url: string }>;
}

export default function FbxWithMarmoset({ url, ModelFBX }: FbxWithMarmosetProps) {
  const [tbsceneUrl, setTbsceneUrl] = useState<string | null>(null);
  const [textureUrls, setTextureUrls] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(true);

  // Check for .tbscene and textures
  useEffect(() => {
    const checkRelatedFiles = async () => {
      try {
        // Check for .tbscene file
        const tbscene = await findTbsceneFile(url);
        setTbsceneUrl(tbscene);
        
        // Check for textures
        const textures = await findTextureFiles(url);
        setTextureUrls(textures);
      } catch (error) {
        console.error('Error checking related files:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkRelatedFiles();
  }, [url]);

  if (isChecking) {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.loadingMessage}>Checking model resources...</p>
      </div>
    );
  }

  // If there is a .tbscene file, use Marmoset Viewer
  if (tbsceneUrl) {
    const MarmosetViewer = dynamic(() => import('./MarmosetViewer'), { ssr: false });
    return <MarmosetViewer url={tbsceneUrl} />;
  }
  
  // If there are textures, use Marmoset Viewer with separate files
  if (textureUrls.length > 0) {
    const MarmosetViewer = dynamic(() => import('./MarmosetViewer'), { ssr: false });
    return <MarmosetViewer url="" meshUrl={url} textureUrls={textureUrls} />;
  }
  
  // Standard FBX rendering through Three.js
  return (
    <div className={styles.previewContainer}>
      <Canvas shadows camera={{ position: [0, 0.5, 3], fov: 50 }}>
        <color attach="background" args={["#1a1a1a"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        
        <Suspense fallback={<Html center><div className={styles.loadingText}>Loading 3D Model...</div></Html>}>
          <ModelFBX url={url} />
        </Suspense>
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true} 
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
        <ContactShadows 
          position={[0, -0.65, 0]} 
          opacity={0.7} 
          scale={10} 
          blur={2} 
          far={3} 
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}