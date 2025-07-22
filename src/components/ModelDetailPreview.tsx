'use client';

import { useGLTF, useAnimations } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, PresentationControls, Stage } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import { Suspense, useEffect, useState, useRef } from 'react';
// Using THREE.Mesh directly from the THREE namespace
import { Html } from '@react-three/drei';
import { Object3DEventMap } from 'three';
import styles from './ModelDetailPreview.module.css';
import dynamic from 'next/dynamic';
import { findTbsceneFile, findTextureFiles } from '@/utils/modelUtils';

interface ModelPreviewProps {
  url: string;
  tbsceneUrl?: string;
}

interface GLTFResult {
  scene: THREE.Group<Object3DEventMap>;
  animations: THREE.AnimationClip[];
}

// GLTF Model Component with enhanced presentation
function ModelGLTF({ url }: { url: string }) {
  const { scene, animations }: GLTFResult = useGLTF(url, true);
  const { actions } = useAnimations(animations, scene);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // Center and scale the model
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Center the model
    scene.position.x = -center.x;
    scene.position.y = -center.y;
    scene.position.z = -center.z;
    
    // Scale the model to fit in view
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      // Optimal scale for professional presentation
      const scale = 3.0 / maxDim; // Increased scale to make model larger
      scene.scale.set(scale, scale, scale);
    }
    
    // Slightly elevate the model to avoid appearing on a "floor"
    scene.position.y += 0.2;
    
    // Play animations if available
    if (actions) {
      Object.keys(actions).forEach((key) => {
        actions[key]?.play();
      });
    }
  }, [scene, actions]);
  
  // No artificial movement for static models
  useFrame(() => {
    // Only update animations if they exist
    if (animations && animations.length > 0) {
      // Animation updates are handled by useAnimations
    }
  });

  return <primitive ref={groupRef} object={scene} />;
}

// FBX Model Component with enhanced presentation
function ModelFBX({ url }: { url: string }) {
  const [object, setObject] = useState<THREE.Group | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);

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
    
    // Log file size info if available in URL
    if (url.includes('KB') || url.includes('bytes')) {
      console.log('Loading small FBX file:', url);
    }
    
    const loader = new FBXLoader();

    loader.load(
      fixedUrl, 
      (loaded) => {
        console.log('FBX model loaded successfully');
        
        // Center the model
        const box = new THREE.Box3().setFromObject(loaded);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        loaded.position.x = -center.x;
        loaded.position.y = -center.y;
        loaded.position.z = -center.z;
        
        // Scale the model to fit in view
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          // Use larger scale for small files
          const scale = url.includes('75,184') || url.includes('73.4 KB') || loaded.children.length < 5
            ? 5.0 / maxDim  // Much larger scale for small models
            : 3.0 / maxDim; // Normal scale for regular models
          loaded.scale.set(scale, scale, scale);
        }
        
        // Slightly elevate the model to avoid appearing on a "floor"
        loaded.position.y += 0.2;
        
        // Completely ignore material warnings
        const originalWarn = console.warn;
        console.warn = function(message) {
          // Suppress all material warnings during model loading
          if (!message.includes('material')) {
            originalWarn.call(console, message);
          }
        };
        
        // Apply standard material to all meshes
        loaded.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            
            // Try different materials based on file size
            let material;
            
            // For small FBX files (like the 75KB one), use BasicMaterial
            if (url.includes('75,184') || url.includes('73.4 KB') || loaded.children.length < 5) {
              material = new THREE.MeshBasicMaterial({
                color: 0xcccccc,
                wireframe: false
              });
            } else {
              // For other models, use PhongMaterial for better quality
              material = new THREE.MeshPhongMaterial({
                color: 0xcccccc,
                shininess: 30,
                specular: 0x444444,
                flatShading: false
              });
            }
            
            // Apply to all mesh materials
            if (Array.isArray(mesh.material)) {
              mesh.material = Array(mesh.material.length).fill(material);
            } else {
              mesh.material = material;
            }
            
            // Simplify geometry if possible
            if (mesh.geometry && mesh.geometry.attributes.position.count > 100000) {
              console.log('High-poly mesh detected, consider optimizing the model');
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
      if (mixer) {
        mixer.stopAllAction();
      }
    };
  }, [url]);

  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
    // No artificial movement for static models
  });



  if (error) {
    return <Html center><div className={styles.errorText}>{error}</div></Html>;
  }

  if (loading) {
    return <Html center><div className={styles.loadingText}>Loading FBX Model...</div></Html>;
  }

  return object ? <primitive ref={groupRef} object={object} /> : null;
}

// Component for handling FBX models with Marmoset support
function FbxModelHandler({ url }: { url: string }) {
  const [tbsceneUrl, setTbsceneUrl] = useState<string | null>(null);
  const [textureUrls, setTextureUrls] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false); // Start with false to skip checking

  // Skip all file checking for API URLs to avoid 404 errors
  useEffect(() => {
    // For API URLs, just render the FBX directly without checking for related files
    if (url.includes('api/models/file') || url.includes('http://localhost:8000/api/models/file/')) {
      setIsChecking(false);
      return;
    }
    
    // Only check for related files for non-API URLs
    let isMounted = true;
    const checkRelatedFiles = async () => {
      try {
        setIsChecking(true);
        // Standard file URL handling for tbscene only
        const tbscene = await findTbsceneFile(url);
        if (isMounted) setTbsceneUrl(tbscene);
        
        // Only check for textures if we're dealing with a storage URL
        if (url.includes('storage/')) {
          const textures = await findTextureFiles(url);
          if (isMounted) setTextureUrls(textures);
        }
      } catch (error) {
        console.error('Error checking related files:', error);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };
    
    checkRelatedFiles();
    
    return () => {
      isMounted = false;
    };
  }, [url]);

  if (isChecking) {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.loadingMessage}>Checking model resources...</p>
      </div>
    );
  }

  // Check if this is an API URL - if so, skip Marmoset
  if (url.includes('api/models/file') || url.includes('http://localhost:8000/api/models/file/')) {
    // Skip Marmoset for API URLs
  }
  // If there is a .tbscene file, use Marmoset Viewer
  else if (tbsceneUrl) {
    const MarmosetViewer = dynamic(() => import('./MarmosetViewer'), { ssr: false });
    return <MarmosetViewer url={tbsceneUrl} />;
  }
  
  // If there are textures, use Marmoset Viewer with separate files
  else if (textureUrls.length > 0) {
    const MarmosetViewer = dynamic(() => import('./MarmosetViewer'), { ssr: false });
    return <MarmosetViewer url="" meshUrl={url} textureUrls={textureUrls} />;
  }
  
  // Enhanced FBX rendering with better visuals
  return (
    <div className={styles.previewContainer}>
      <Canvas shadows camera={{ position: [0, 0, 2.5], fov: 50 }} onCreated={({gl}) => {
          gl.setClearColor("#1a1a1a");
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lower pixel ratio to prevent context loss
          // @ts-expect-error - physicallyCorrectLights exists but TypeScript doesn't recognize it
          gl.physicallyCorrectLights = true;
        }}>
        <color attach="background" args={["#1a1a1a"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        
        <Suspense fallback={<Html center><div className={styles.loadingText}>Loading 3D Model...</div></Html>}>
          <PresentationControls
            global
            rotation={[0, -0.3, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 2]}
            config={{ mass: 2, tension: 500 }}
            // @ts-expect-error - snap prop is valid but TypeScript has incorrect type definition
            snap={{ mass: 4, tension: 1500 }}
          >
            <ModelFBX url={url} />
          </PresentationControls>
        </Suspense>
        
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

export default function ModelDetailPreview({ url }: ModelPreviewProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contextLost, setContextLost] = useState(false);
  const isVideo = url?.toLowerCase().endsWith('.mp4');
  const isFBX = url?.toLowerCase().endsWith('.fbx');
  const isGLTF = url?.toLowerCase().endsWith('.gltf') || url?.toLowerCase().endsWith('.glb');
  const isMarmoset = url?.toLowerCase().endsWith('.mview') || url?.toLowerCase().endsWith('.tbscene');
  
  // Handle WebGL context loss
  useEffect(() => {
    const handleContextLost = () => {
      console.warn('WebGL context lost');
      setContextLost(true);
    };
    
    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setContextLost(false);
    };
    
    window.addEventListener('webglcontextlost', handleContextLost);
    window.addEventListener('webglcontextrestored', handleContextRestored);
    
    // Set a timeout to reload the component if context is lost
    let timeoutId: number;
    if (contextLost) {
      timeoutId = window.setTimeout(() => {
        setIsLoading(true);
        setContextLost(false);
        setIsLoading(false);
      }, 2000);
    }
    
    return () => {
      window.removeEventListener('webglcontextlost', handleContextLost);
      window.removeEventListener('webglcontextrestored', handleContextRestored);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [contextLost]);
  
  // Remove duplicate context loss handler

  useEffect(() => {
    const checkFile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (url.startsWith('blob:')) {
          setIsLoading(false);
          return;
        }

        // Skip HEAD check for API URLs to avoid CORS issues
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
    
    // Cleanup URL on unmount
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

  if (contextLost) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>WebGL context lost. Attempting to recover...</p>
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
        <Canvas shadows camera={{ position: [0, 0, 2.5], fov: 40 }} onCreated={({gl}) => {
          gl.setClearColor("#1a1a1a");
          // Set lower pixel ratio to reduce GPU load
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        }}>
          <color attach="background" args={["#1a1a1a"]} />
          
          <Suspense fallback={<Html center><div className={styles.loadingText}>Loading 3D Model...</div></Html>}>
            <Stage environment="studio" intensity={0.6} shadows adjustCamera>
              <ModelGLTF url={url} />
            </Stage>
          </Suspense>
          
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true} 
            autoRotate={true}
            autoRotateSpeed={0.3}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 6}
          />
        </Canvas>
      </div>
    );
  }

  if (isFBX) {
    return <FbxModelHandler url={url} />;
  }
  
  if (isMarmoset && !url.includes('api/models/file') && !url.includes('http://localhost:8000/api/models/file/')) {
    const MarmosetViewer = dynamic(() => import('./MarmosetViewer'), { ssr: false });
    return <MarmosetViewer url={url} />;
  }
  
  return null;
}