export default function getLastSlashValueFromCurrentUrl(): string | null {
  try {
    const currentUrl = window.location.href;
    const parsedUrl = new URL(currentUrl);
    const pathname = parsedUrl.pathname;
    const pathSegments = pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1] || pathSegments[pathSegments.length - 2] || '';
    return decodeURIComponent(lastSegment);
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}