'use client';

import React from 'react';
import styles from './GlbGuide.module.css';

export default function GlbGuidePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>GLB Format Guide for 3D Artists</h1>
      
      <p className={styles.intro}>
        This guide provides information on how to prepare and export 3D models in GLB format for our web platform.
      </p>
      
      <section className={styles.section}>
        <h2>Why GLB Format?</h2>
        <p>GLB (GL Binary) is the binary file format representation of 3D models using the glTF 2.0 specification. It's ideal for web applications because:</p>
        <ul className={styles.list}>
          <li>It's a single file that includes geometry, materials, and textures</li>
          <li>It's compact and optimized for transmission over the web</li>
          <li>It's widely supported by 3D web frameworks like Three.js</li>
          <li>It preserves PBR materials and animations</li>
        </ul>
      </section>
      
      <section className={styles.section}>
        <h2>Exporting to GLB</h2>
        
        <div className={styles.exportGuide}>
          <h3>From Blender</h3>
          <ol className={styles.steps}>
            <li>Go to File &gt; Export &gt; glTF 2.0 (.glb/.gltf)</li>
            <li>Select "GLB" format in the export options</li>
            <li>Enable "Include" options for:
              <ul>
                <li>Selected Objects (if you want to export only selected objects)</li>
                <li>Custom Properties</li>
                <li>Cameras and Punctual Lights (if needed)</li>
              </ul>
            </li>
            <li>Under "Geometry", enable:
              <ul>
                <li>UVs</li>
                <li>Normals</li>
                <li>Tangents (if using normal maps)</li>
                <li>Vertex Colors (if used)</li>
              </ul>
            </li>
            <li>Under "Materials", enable:
              <ul>
                <li>Materials</li>
                <li>Export Texture Images</li>
              </ul>
            </li>
            <li>Under "Animation", enable if your model has animations</li>
            <li>Click "Export GLB"</li>
          </ol>
        </div>
        
        <div className={styles.exportGuide}>
          <h3>From Maya</h3>
          <ol className={styles.steps}>
            <li>Install the glTF Exporter plugin</li>
            <li>Go to File &gt; Export All or Export Selection</li>
            <li>Choose glTF Binary (*.glb) as the file type</li>
            <li>Configure export settings:
              <ul>
                <li>Enable "Export Textures"</li>
                <li>Enable "Export Materials"</li>
                <li>Enable "Export Animations" if needed</li>
              </ul>
            </li>
            <li>Click "Export"</li>
          </ol>
        </div>
        
        <div className={styles.exportGuide}>
          <h3>From 3ds Max</h3>
          <ol className={styles.steps}>
            <li>Install the Babylon.js Exporter or glTF Exporter plugin</li>
            <li>Go to File &gt; Export &gt; Export</li>
            <li>Choose glTF Binary (*.glb) as the file type</li>
            <li>Configure export settings to include materials and textures</li>
            <li>Click "Export"</li>
          </ol>
        </div>
        
        <div className={styles.tip}>
          <strong>Tip:</strong> Always check your exported GLB file in a viewer like <a href="https://gltf-viewer.donmccurdy.com/" target="_blank" rel="noopener noreferrer">glTF Viewer</a> before uploading to ensure everything looks correct.
        </div>
      </section>
      
      <section className={styles.section}>
        <h2>Best Practices</h2>
        <ul className={styles.list}>
          <li><strong>Optimize mesh geometry</strong> - Keep polygon count reasonable (under 100k triangles for web)</li>
          <li><strong>Use texture atlases</strong> - Combine textures where possible to reduce draw calls</li>
          <li><strong>Texture sizes</strong> - Keep textures at 2048×2048 or smaller for web use</li>
          <li><strong>PBR materials</strong> - Use standard PBR workflow (Base Color, Metallic, Roughness, Normal)</li>
          <li><strong>Animations</strong> - Keep animations simple and optimize keyframes</li>
          <li><strong>Scale</strong> - Use consistent units (preferably meters)</li>
          <li><strong>Origin</strong> - Center your model at the world origin (0,0,0)</li>
        </ul>
      </section>
      
      <section className={styles.section}>
        <h2>Common Issues and Solutions</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Issue</th>
                <th>Solution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Missing textures</td>
                <td>Ensure textures are packed in the GLB or use relative paths</td>
              </tr>
              <tr>
                <td>Incorrect materials</td>
                <td>Use standard PBR materials and check export settings</td>
              </tr>
              <tr>
                <td>Inverted normals</td>
                <td>Check face orientation before export</td>
              </tr>
              <tr>
                <td>File too large</td>
                <td>Optimize geometry, reduce texture sizes, and remove unused data</td>
              </tr>
              <tr>
                <td>Animations not working</td>
                <td>Ensure animations are properly named and keyframed</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className={styles.warning}>
          <strong>Important:</strong> Always test your GLB files in a web viewer before submitting them to ensure compatibility and performance.
        </div>
      </section>
      
      <section className={styles.section}>
        <h2>File Size Guidelines</h2>
        <ul className={styles.list}>
          <li><strong>Small models</strong> (simple objects): 1-5 MB</li>
          <li><strong>Medium models</strong> (characters, furniture): 5-15 MB</li>
          <li><strong>Large models</strong> (detailed environments): 15-30 MB</li>
        </ul>
      </section>
      
      <p className={styles.contact}>
        For any questions or issues with the GLB format, please contact our support team.
      </p>
    </div>
  );
}