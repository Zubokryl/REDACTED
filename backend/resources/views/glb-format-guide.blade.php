<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GLB Format Guide for 3D Artists</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        h2 {
            color: #444;
            margin-top: 30px;
        }
        code {
            background-color: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: 'Courier New', Courier, monospace;
        }
        .tip {
            background-color: #e6f7ff;
            border-left: 4px solid #1890ff;
            padding: 10px 15px;
            margin: 20px 0;
        }
        .warning {
            background-color: #fff7e6;
            border-left: 4px solid #fa8c16;
            padding: 10px 15px;
            margin: 20px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
    </style>
</head>
<body>
    <h1>GLB Format Guide for 3D Artists</h1>
    
    <p>This guide provides information on how to prepare and export 3D models in GLB format for our web platform.</p>
    
    <h2>Why GLB Format?</h2>
    <p>GLB (GL Binary) is the binary file format representation of 3D models using the glTF 2.0 specification. It's ideal for web applications because:</p>
    <ul>
        <li>It's a single file that includes geometry, materials, and textures</li>
        <li>It's compact and optimized for transmission over the web</li>
        <li>It's widely supported by 3D web frameworks like Three.js</li>
        <li>It preserves PBR materials and animations</li>
    </ul>
    
    <h2>Exporting to GLB</h2>
    
    <h3>From Blender</h3>
    <ol>
        <li>Go to File > Export > glTF 2.0 (.glb/.gltf)</li>
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
    
    <h3>From Maya</h3>
    <ol>
        <li>Install the glTF Exporter plugin</li>
        <li>Go to File > Export All or Export Selection</li>
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
    
    <h3>From 3ds Max</h3>
    <ol>
        <li>Install the Babylon.js Exporter or glTF Exporter plugin</li>
        <li>Go to File > Export > Export</li>
        <li>Choose glTF Binary (*.glb) as the file type</li>
        <li>Configure export settings to include materials and textures</li>
        <li>Click "Export"</li>
    </ol>
    
    <div class="tip">
        <strong>Tip:</strong> Always check your exported GLB file in a viewer like <a href="https://gltf-viewer.donmccurdy.com/" target="_blank">glTF Viewer</a> before uploading to ensure everything looks correct.
    </div>
    
    <h2>Best Practices</h2>
    <ul>
        <li><strong>Optimize mesh geometry</strong> - Keep polygon count reasonable (under 100k triangles for web)</li>
        <li><strong>Use texture atlases</strong> - Combine textures where possible to reduce draw calls</li>
        <li><strong>Texture sizes</strong> - Keep textures at 2048×2048 or smaller for web use</li>
        <li><strong>PBR materials</strong> - Use standard PBR workflow (Base Color, Metallic, Roughness, Normal)</li>
        <li><strong>Animations</strong> - Keep animations simple and optimize keyframes</li>
        <li><strong>Scale</strong> - Use consistent units (preferably meters)</li>
        <li><strong>Origin</strong> - Center your model at the world origin (0,0,0)</li>
    </ul>
    
    <h2>Common Issues and Solutions</h2>
    <table>
        <tr>
            <th>Issue</th>
            <th>Solution</th>
        </tr>
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
    </table>
    
    <div class="warning">
        <strong>Important:</strong> Always test your GLB files in a web viewer before submitting them to ensure compatibility and performance.
    </div>
    
    <h2>File Size Guidelines</h2>
    <ul>
        <li><strong>Small models</strong> (simple objects): 1-5 MB</li>
        <li><strong>Medium models</strong> (characters, furniture): 5-15 MB</li>
        <li><strong>Large models</strong> (detailed environments): 15-30 MB</li>
    </ul>
    
    <p>For any questions or issues with the GLB format, please contact our support team.</p>
</body>
</html>