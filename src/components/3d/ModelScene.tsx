import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { Suspense } from 'react';
import styles from './ModelScene.module.css';

interface ModelSceneProps {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  fov?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

/**
 * Reusable 3D scene component for displaying models
 */
export const ModelScene: React.FC<ModelSceneProps> = ({
  children,
  cameraPosition = [0, 0, 3], // Position camera at center level
  fov = 45, // Reduced FOV for better perspective
  autoRotate = true,
  autoRotateSpeed = 0.5,
}) => {
  return (
    <div className={styles.previewContainer}>
      <Canvas shadows camera={{ position: cameraPosition, fov }}>
        <color attach="background" args={["#1a1a1a"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        
        <Suspense fallback={<Html center><div className={styles.loadingText}>Loading 3D Model...</div></Html>}>
          {children}
        </Suspense>
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true} 
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
          minDistance={1.5} // Prevent zooming too close
          maxDistance={10} // Prevent zooming too far
          target={[0, 0, 0]} // Look at center
        />
        <ContactShadows 
          position={[0, -0.5, 0]} 
          opacity={0.7} 
          scale={10} 
          blur={2} 
          far={3} 
          rotation={[-Math.PI / 2, 0, 0]} // Ensure shadow is flat
        />
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
};