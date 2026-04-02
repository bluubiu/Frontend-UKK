// Helper function to generate correct image URLs
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Construct URL for local storage
    // Use 127.0.0.1 to match the API base URL (from axios.js)
    const baseUrl = 'http://127.0.0.1:8000';
    // Encode each segment of the path so that # and spaces do not break the URL
    const encodedPath = imagePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    return `${baseUrl}/storage/${encodedPath}`;
};
