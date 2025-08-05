'use client';

import React from 'react';
import styles from './MarmosetViewer.module.css';

interface MarmosetIframeProps {
  tbsceneUrl?: string;
  width?: string;
  height?: string;
}

export default function MarmosetIframe({ tbsceneUrl, width = '100%', height = '500px' }: MarmosetIframeProps) {
  // Создаем URL для iframe, который будет использовать Marmoset Viewer
  const viewerUrl = `https://viewer.marmoset.co/main/viewer.html?${tbsceneUrl ? `file=${encodeURIComponent(tbsceneUrl)}` : ''}`;
  
  return (
    <div className={styles.marmosetContainer} style={{ width, height }}>
      <iframe 
        src={viewerUrl}
        width="100%" 
        height="100%" 
        frameBorder="0" 
        allowFullScreen
        title="Marmoset Viewer"
        style={{ borderRadius: '8px' }}
      />
    </div>
  );
}