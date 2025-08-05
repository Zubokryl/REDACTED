'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import styles from './MarmosetContainer.module.css';

interface MarmosetContainerProps {
  fbxUrl: string;
  tbsceneUrl?: string | null;
  textureUrls?: string[] | null;
  width?: string;
  height?: string;
  fallback?: React.ReactNode;
}

export default function MarmosetContainer({ 
  fbxUrl, 
  tbsceneUrl, 
  textureUrls = [], 
  width = '100%', 
  height = '500px',
  fallback
}: MarmosetContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const viewerInitialized = useRef(false);

  // Log props for debugging
  useEffect(() => {
    console.log('MarmosetContainer props:', { fbxUrl, tbsceneUrl, textureUrls });
    // Не проверяем доступность файлов через fetch из-за ограничений CORS
  }, [fbxUrl, tbsceneUrl, textureUrls]);

  // Initialize viewer when script is loaded
  useEffect(() => {
    if (!scriptLoaded || viewerInitialized.current) return;

    const initializeViewer = () => {
      // Ensure container is available
      if (!containerRef.current) {
        console.error('Container not available, retrying in 500ms');
        setTimeout(initializeViewer, 500);
        return;
      }
      try {
        if (!window.marmoset) {
          console.error('Marmoset not available');
          setError('Marmoset viewer not available');
          setLoading(false);
          return;
        }

        // Clear container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        const params = {
          width: width,
          height: height,
          autoStart: true,
          fullFrame: true,
          pagePreset: 'default',
          onLoad: () => {
            console.log('Marmoset viewer loaded successfully');
            setLoading(false);
          },
          onLoadError: (err: any) => {
            console.error('Marmoset load error:', err);
            setError('Failed to load model in Marmoset viewer');
            setLoading(false);
          }
        };

        // Всегда пробуем использовать fbxUrl с Marmoset
        try {
          console.log('Using Marmoset with fbxUrl:', fbxUrl);
          
          // Если есть tbscene файл, используем его
          if (tbsceneUrl) {
            // Исправляем URL для tbscene файла, если он содержит двойной URL
            const cleanTbsceneUrl = tbsceneUrl.includes('http://localhost:8000/storage/') && tbsceneUrl.includes('http://localhost:8000/api/') 
              ? tbsceneUrl.split('http://localhost:8000/storage/')[1] 
              : tbsceneUrl;
            console.log('Using tbscene file:', cleanTbsceneUrl);
            window.marmoset.embed(cleanTbsceneUrl, params);
          }
          // Если есть текстуры, используем их с mesh
          else if (textureUrls && textureUrls.length > 0) {
            console.log('Using mesh with textures:', { fbxUrl, textureUrls });
            window.marmoset.embed('', {
              ...params,
              meshUrl: fbxUrl,
              maps: textureUrls
            });
          }
          // Если нет ни tbscene, ни текстур, используем только fbxUrl
          else {
            console.log('Using only fbxUrl:', fbxUrl);
            window.marmoset.embed('', {
              ...params,
              meshUrl: fbxUrl
            });
          }
          
          viewerInitialized.current = true;
        } catch (err) {
          console.error('Error embedding model with Marmoset:', err);
          setError('Failed to load model with Marmoset');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing Marmoset viewer:', err);
        setError('Failed to initialize Marmoset viewer');
        setLoading(false);
      }
    };

    // Wait a bit to ensure the container is fully rendered
    const timer = setTimeout(() => {
      initializeViewer();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        viewerInitialized.current = false;
      }
    };
  }, [scriptLoaded, fbxUrl, tbsceneUrl, textureUrls, width, height]);

  // Если есть ошибка и есть fallback, используем его
  if (error && fallback) {
    return <>{fallback}</>;
  }
  
  // Всегда используем fallback, так как Marmoset не работает
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Если нет fallback, показываем сообщение об ошибке
  return (
    <div className={styles.container} style={{ width, height }}>
      <div className={styles.errorOverlay}>
        <div className={styles.errorText}>
          Marmoset Viewer is not available
          <p>Please try again later.</p>
        </div>
      </div>
    </div>
  );
}

// Add this to global.d.ts or declare it here
declare global {
  interface Window {
    marmoset: {
      embed: (url: string, params: object) => void;
    };
  }
}