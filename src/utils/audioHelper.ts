/**
 * Utility for client-side audio processing.
 * Slices large audio files into smaller chunks to bypass the 25MB limit of standard ASR APIs (like Whisper).
 */

export function chunkAudioFile(file: File, maxSizeBytes: number = 24 * 1024 * 1024): File[] {
  const chunks: File[] = [];
  let offset = 0;
  let chunkIndex = 0;

  while (offset < file.size) {
    const slice = file.slice(offset, offset + maxSizeBytes, file.type);
    
    // Create a new File object from the slice to preserve metadata
    // We append the chunk index to the name to keep them distinct
    const chunkName = `${file.name.replace(/\.[^/.]+$/, "")}_chunk${chunkIndex}.${file.name.split('.').pop()}`;
    const chunkFile = new File([slice], chunkName, { type: file.type });
    
    chunks.push(chunkFile);
    offset += maxSizeBytes;
    chunkIndex++;
  }

  return chunks;
}
