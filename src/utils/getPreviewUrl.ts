const backendUrl = 'http://localhost:8000';

export function getPreviewUrl(previewFile?: string | File): string {
  if (!previewFile) {
    return '/placeholder.png';
  }

  if (typeof previewFile === 'string') {
    if (previewFile.startsWith('http://') || previewFile.startsWith('https://')) {
      return previewFile;
    }
    return `${backendUrl}/storage/previews/${previewFile}`;
  }

  // previewFile is a File
  return URL.createObjectURL(previewFile);
}
