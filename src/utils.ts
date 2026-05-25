/**
 * Utility functions for Whisk Workspace
 */

/**
 * Downloads an image from any URL (including cross-origin, like Pollinations AI)
 * by fetching it as a Blob first and generating a native download.
 */
export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
  try {
    if (imageUrl.startsWith("data:")) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (err) {
    console.error("Failed to download image via blob fetch", err);
    // Graceful fallback to opening in new tab
    const fallbackLink = document.createElement("a");
    fallbackLink.href = imageUrl;
    fallbackLink.target = "_blank";
    fallbackLink.rel = "noreferrer";
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);
  }
}
