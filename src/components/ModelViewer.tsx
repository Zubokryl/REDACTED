'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Dragon Model
function Model() {
  const ref = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/dragon.glb');
  const { actions, mixer } = useAnimations(animations, ref);
  const { camera, scene: mainScene } = useThree(); 

  const [currentActionName, setCurrentActionName] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);



  useEffect(() => {
    mainScene.background = null;
    if (!mixer || !actions || animations.length === 0) return;

    mixer.timeScale = 0.1;

    let current = 0;
    let animationStart = performance.now();

    const playNext = () => {
      const clip = animations[current];
      const action = actions[clip.name];

      if (action) {
        setCurrentActionName(clip.name);
        setIsRunning(clip.name === 'Run');
        if (clip.name === 'Run') {
          audioRef.current?.play();
        }

        action.reset().fadeIn(0.5).play();
      }

      animationStart = performance.now();

      const animateSwitch = () => {
        const now = performance.now();
        const elapsed = (now - animationStart) / 1000;
        const duration = clip.duration / mixer.timeScale;

        if (elapsed >= duration) {
          action?.fadeOut(0.5);
          current = (current + 1) % animations.length;
          playNext();
          return;
        }

        requestAnimationFrame(animateSwitch);
      };

      animateSwitch();
    };

    playNext();

    return () => {
      mixer.stopAllAction();
    };
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();

      const speed = 5;
      if (ref.current.position.z > 5) {
        ref.current.position.z -= speed;
      }

      ref.current.position.y = -5 + Math.sin(t / 2) * 0.01;
      ref.current.position.x = 0;
      if (ref.current.position.z < 3) {
        ref.current.position.z = 3;
      }

      const currentScale = ref.current.scale.x;
      let targetScale = 6;

      if (isRunning) {
        targetScale = 8;
      } else if (currentActionName === 'Idle Stand' || currentActionName === 'Idle Sit') {
        targetScale = 8;
      }

      const lerpedScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.03);
      ref.current.scale.set(lerpedScale, lerpedScale, lerpedScale);

      camera.position.z = 50; 
      camera.lookAt(0, 0, 0);
    }

    mixer?.update(delta);
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      position={[0, -10, 5]}
    />
  );
}

// Fire Particles effect
const FireParticles = () => {
    const fireColor = new THREE.Color(0xff5000); // Fire color
    return (
      <group>
        <group position={[-15, -10, 0]}>
          <Particles fireColor={fireColor} />
        </group>
        <group position={[15, -10, 0]}>
          <Particles fireColor={fireColor} />
        </group>
      </group>
    );
  };
  
  // Individual Particles
  const Particles = ({ fireColor }: { fireColor: THREE.Color }) => {
    const numParticles = 120;
    const particleRefs = useRef<THREE.Mesh[]>([]);
    const [particles, setParticles] = useState<React.ReactNode[]>([]);
  
    useEffect(() => {
      const newParticles = [];
      particleRefs.current = [];
  
      for (let i = 0; i < numParticles; i++) {
        const startTime = performance.now() + Math.random() * 1000;
  
        const isSmoke = Math.random() > 0.7;
  
        const particle = (
          <mesh
            key={i}
            ref={(el) => el && particleRefs.current.push(el)}
            position={[Math.random() * 2 - 1, Math.random() * 2 - 1, 0]}
            scale={[0.2, 0.2, 0.2]}
            userData={{
              startTime,
              initialX: Math.random() * 2 - 1,
              initialZ: Math.random() * 2 - 1,
              isSmoke,
            }}
          >
            <circleGeometry args={[0.4, 16]} />
            <meshBasicMaterial
              transparent
              opacity={isSmoke ? 0.15 : 0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              color={isSmoke ? 0x333333 : fireColor}
            />
          </mesh>
        );
  
        newParticles.push(particle);
      }
  
      setParticles(newParticles);
    }, [fireColor]);
  
    useFrame(() => {
      const now = performance.now();
  
      particleRefs.current.forEach((particle) => {
        if (!particle) return;
  
        const speed = 0.01;
        const lifetime = particle.userData.isSmoke ? 5.5 : 2.2;
        const elapsed = (now - particle.userData.startTime) / 1000;
  
        if (elapsed > lifetime) {
          const initialX = Math.random() * 2 - 1;
          const initialZ = Math.random() * 2 - 1;
          const isSmoke = Math.random() > 0.7;
  
          particle.userData.startTime = now + Math.random() * 1000;
          particle.userData.initialX = initialX;
          particle.userData.initialZ = initialZ;
          particle.userData.isSmoke = isSmoke;
          particle.position.set(initialX, Math.random() * 2 - 1, initialZ);
          return;
        }
  
        const progress = elapsed / lifetime;
  
        // Rise Up
        particle.position.y += particle.userData.isSmoke
          ? 0.018 + Math.random() * 0.005 
          : 0.025 + Math.random() * speed * 0.2;
  
        // Fluctuations
        const randomness = 1 - progress;
        particle.position.x = particle.userData.initialX * randomness + (Math.random() - 0.5) * 0.01;
        particle.position.z = particle.userData.initialZ * randomness + (Math.random() - 0.5) * 0.01;
  
        // Size
        const scale = particle.userData.isSmoke
          ? 0.3 + progress * 1.0 
          : 0.07 + Math.sin(elapsed * 5) * 0.07;
        particle.scale.set(scale, scale, scale);
  
        // Transparancy and color
        const mat = particle.material as THREE.MeshBasicMaterial;
        mat.opacity = THREE.MathUtils.lerp(particle.userData.isSmoke ? 0.15 : 0.5, 0, progress);
        mat.color.set(particle.userData.isSmoke ? 0x333333 : fireColor);
      });
    });
  
    return <group>{particles}</group>;
  };
  
  export default function ModelViewer() {
    return (
      <Canvas
        camera={{ position: [2, 1, 50], fov: 30 }}
        gl={{ alpha: true, preserveDrawingBuffer: true }}
        style={{
          width: '100vw',
          height: '100vh',
          background: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <spotLight position={[3, 5, 0]} intensity={0.6} angle={Math.PI / 6} penumbra={1} />
  
        <Suspense fallback={null}>
          <Model />
          <FireParticles />
        </Suspense>
  
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    );
  }