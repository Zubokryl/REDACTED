'use client';

import React, { useEffect, useRef } from 'react';
import styles from './MarmosetViewer.module.css';

interface MarmosetViewerProps {
  url: string;
  width?: string;
  height?: string;
  textureUrls?: string[];
  meshUrl?: string;
}

declare global {
  interface Window {
    marmoset: {
      embed: (url: string, params: object) => void;
    };
  }
}

export default function MarmosetViewer({ url, width = '100%', height = '500px', textureUrls = [], meshUrl }: MarmosetViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const viewerInitialized = useRef(false);

  useEffect(() => {
    // Load Marmoset Viewer script if not already loaded
    if (!document.getElementById('marmoset-viewer-script')) {
      scriptRef.current = document.createElement('script');
      scriptRef.current.id = 'marmoset-viewer-script';
      scriptRef.current.src = 'https://viewer.marmoset.co/main/marmoset.js';
      scriptRef.current.async = true;
      
      document.body.appendChild(scriptRef.current);
    }

    // Initialize viewer when script is loaded
    const initViewer = () => {
      if (containerRef.current && window.marmoset && !viewerInitialized.current) {
        // Clear container first
        containerRef.current.innerHTML = '';
        
        // Initialize Marmoset Viewer
        const params = {
          width: width,
          height: height,
          autoStart: true,
          fullFrame: true,
          pagePreset: 'default',
          thumbnailURL: null
        };
        
        // If mesh and textures are specified, use them
        if (meshUrl && textureUrls && textureUrls.length > 0) {
          // For the case when we have separate mesh and textures
          window.marmoset.embed(url, {
            ...params,
            meshUrl: meshUrl,
            maps: textureUrls
          });
        } else {
          // Standard case - just a .mview or .tbscene file
          window.marmoset.embed(url, params);
        }
        
        viewerInitialized.current = true;
      }
    };

    // Check if script is already loaded
    if (window.marmoset) {
      initViewer();
    } else {
      // Wait for script to load
      const onScriptLoad = () => initViewer();
      scriptRef.current?.addEventListener('load', onScriptLoad);
      
      return () => {
        scriptRef.current?.removeEventListener('load', onScriptLoad);
      };
    }

    return () => {
      // Cleanup
      if (containerRef.current && viewerInitialized.current) {
        containerRef.current.innerHTML = '';
        viewerInitialized.current = false;
      }
    };
  }, [url, width, height]);

  return (
    <div 
      ref={containerRef} 
      className={styles.marmosetContainer}
      style={{ width, height }}
    />
  );
}