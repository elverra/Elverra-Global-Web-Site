// Utility to handle image paths with fallbacks
export const getImageUrl = (imagePath: string, fallback?: string): string => {
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Ensure the path starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Return the path with fallback handling in the component
  return normalizedPath;
};

// Function to handle image loading errors
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, fallback?: string) => {
  const img = event.currentTarget;
  if (fallback && img.src !== fallback) {
    img.src = fallback;
  } else {
    // Use a default placeholder or hide the image
    img.style.display = 'none';
  }
};
