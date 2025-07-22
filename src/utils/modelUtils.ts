/**
 * Utilities for working with 3D models
 */

/**
 * Checks if a file exists at the specified URL
 * @param url URL of the file to check
 * @returns Promise<boolean> - whether the file exists
 */
export async function fileExists(url: string): Promise<boolean> {
  try {
    // Skip checking for API URLs to avoid unnecessary 404s
    if (url.includes('api/models/')) {
      return false;
    }
    
    // Skip checking for texture files in certain paths
    if (url.includes('/textures/') && !url.includes('storage/textures/')) {
      return false;
    }
    
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

/**
 * Finds related texture files for an FBX model
 * @param fbxUrl URL of the FBX model
 * @returns Promise<string[]> - array of texture URLs
 */
export async function findTextureFiles(modelUrl: string): Promise<string[]> {
  // Skip texture checking for API URLs
  if (modelUrl.includes('api/models/')) {
    return [];
  }
  
  const baseUrl = modelUrl.substring(0, modelUrl.lastIndexOf('/') + 1);
  const baseName = modelUrl.substring(modelUrl.lastIndexOf('/') + 1, modelUrl.lastIndexOf('.'));
  
  // Typical texture extensions
  const textureExtensions = [
    'diffuse.jpg', 'diffuse.png', 
    'normal.jpg', 'normal.png',
    'specular.jpg', 'specular.png',
    'roughness.jpg', 'roughness.png',
    'metallic.jpg', 'metallic.png',
    'ao.jpg', 'ao.png',
    'albedo.jpg', 'albedo.png',
    'basecolor.jpg', 'basecolor.png'
  ];
  
  const textureUrls: string[] = [];
  
  // Only check for textures in storage URLs
  if (modelUrl.includes('storage/')) {
    // Check for the existence of each possible texture file
    for (const ext of textureExtensions) {
      // Check for textures in the same directory
      const textureUrl = `${baseUrl}${baseName}_${ext}`;
      if (await fileExists(textureUrl)) {
        textureUrls.push(textureUrl);
      }
      
      // Check for textures in the textures subdirectory
      const texturesDirUrl = `${baseUrl}textures/${baseName}_${ext}`;
      if (await fileExists(texturesDirUrl)) {
        textureUrls.push(texturesDirUrl);
      }
      
      // Check for textures without the model name prefix
      const simpleTextureUrl = `${baseUrl}textures/${ext}`;
      if (await fileExists(simpleTextureUrl)) {
        textureUrls.push(simpleTextureUrl);
      }
    }
  }
  
  return textureUrls;
}

/**
 * Checks if a .tbscene file exists for an FBX model
 * @param fbxUrl URL of the FBX model
 * @returns Promise<string | null> - URL of the .tbscene file or null
 */
export async function findTbsceneFile(modelUrl: string): Promise<string | null> {
  // Skip tbscene checks for API URLs to avoid 404 errors
  if (modelUrl.includes('api/models/file')) {
    return null;
  }
  
  // Check if this is already a .tbscene file
  if (modelUrl.toLowerCase().endsWith('.tbscene')) {
    return modelUrl;
  }
  
  // For non-API URLs, we can still check for tbscene files
  // Extract the filename and base URL
  const baseUrl = modelUrl.substring(0, modelUrl.lastIndexOf('/') + 1);
  const filename = modelUrl.split('/').pop() || '';
  const baseName = filename.substring(0, filename.lastIndexOf('.'));
  
  // Standard URL handling
  const tbsceneUrl = `${baseUrl}${baseName}.tbscene`;
  
  if (await fileExists(tbsceneUrl)) {
    return tbsceneUrl;
  }
  
  // Check for .tbscene file in the tbscenes directory
  const tbscenesDirUrl = `${baseUrl}tbscenes/${baseName}.tbscene`;
  if (await fileExists(tbscenesDirUrl)) {
    return tbscenesDirUrl;
  }
  
  return null;
}