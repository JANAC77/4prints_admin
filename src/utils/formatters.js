/**
 * Formats an ISO date string into a human-readable format
 * e.g., "16 Sep 2026, 01:15 PM"
 */
export function formatDate(dateString) {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return String(dateString);
  }
}

/**
 * Returns a relative time string (e.g. "5m ago", "2 hours ago")
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDate(dateString);
  } catch {
    return 'Recently';
  }
}

/**
 * Converts text into a clean URL-friendly slug
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-')        // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Truncates text with ellipsis
 */
export function truncate(text, max = 50) {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.substring(0, max) + '...';
}

/**
 * Formats file size in bytes to KB/MB
 */
export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Checks if a Cloudflare R2 / AWS S3 presigned URL is still valid and not expired.
 */
export function isPresignedUrlValid(url) {
  try {
    if (!url.includes('X-Amz-Signature') || !url.includes('X-Amz-Date') || !url.includes('X-Amz-Expires')) {
      return false;
    }
    const parsed = new URL(url);
    const dateStr = parsed.searchParams.get('X-Amz-Date');
    const expiresSec = parseInt(parsed.searchParams.get('X-Amz-Expires') || '0', 10);
    if (!dateStr || !expiresSec) return false;

    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    const hour = parseInt(dateStr.substring(9, 11), 10);
    const min = parseInt(dateStr.substring(11, 13), 10);
    const sec = parseInt(dateStr.substring(13, 15), 10);

    const signTime = Date.UTC(year, month, day, hour, min, sec);
    const expireTime = signTime + expiresSec * 1000;

    // Buffer 5 minutes before actual expiration
    return Date.now() < expireTime - 300000;
  } catch {
    return false;
  }
}

/**
 * Resolves an image URL so it renders properly in the browser.
 * Preserves active presigned R2 URLs, routes unsigned or expired private
 * Cloudflare R2 URLs through the /r2-media proxy, and handles fallback placeholders.
 */
export function getDisplayImageUrl(url, fallback = 'https://placehold.co/200x200/1e293b/f8fafc?text=Print') {
  if (!url || typeof url !== 'string') return fallback;
  const cleanUrl = url.trim();
  if (!cleanUrl) return fallback;

  // Base64 or Blob URLs can be used directly
  if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) return cleanUrl;

  // If already a local relative proxy URL, return as is
  if (cleanUrl.startsWith('/r2-media/')) return cleanUrl;

  // If already a full local host URL pointing to /r2-media/, return as relative
  if (cleanUrl.includes('/r2-media/')) {
    const idx = cleanUrl.indexOf('/r2-media/');
    return cleanUrl.substring(idx);
  }

  // If the URL is already a valid, active presigned R2 URL, use it directly (no proxy hop needed)
  if (cleanUrl.includes('X-Amz-Signature') && isPresignedUrlValid(cleanUrl)) {
    return cleanUrl;
  }

  // Handle Cloudflare R2 bucket storage URLs (raw or expired presigned)
  if (cleanUrl.includes('r2.cloudflarestorage.com')) {
    try {
      const noQuery = cleanUrl.split('?')[0];

      // Format 1: https://<endpoint>/4printdev/<key>
      if (noQuery.includes('r2.cloudflarestorage.com/4printdev/')) {
        const key = noQuery.split('r2.cloudflarestorage.com/4printdev/')[1];
        if (key) return `/r2-media/${key}`;
      }

      // Format 2: https://4printdev.<endpoint>/<key>
      if (noQuery.includes('.r2.cloudflarestorage.com/')) {
        let key = noQuery.split('.r2.cloudflarestorage.com/')[1];
        if (key) {
          key = key.replace(/^4printdev\//, '');
          return `/r2-media/${key}`;
        }
      }

      // Generic fallback for any r2.cloudflarestorage.com path
      const afterDomain = noQuery.split('r2.cloudflarestorage.com/')[1];
      if (afterDomain) {
        const key = afterDomain.replace(/^4printdev\//, '');
        return `/r2-media/${key}`;
      }
    } catch {
      // fallback
    }
  }

  // Handle direct storage keys like "categories/...", "subcategories/...", "products/..."
  if (/^(categories|subcategories|products|admins)\//.test(cleanUrl)) {
    return `/r2-media/${cleanUrl.split('?')[0]}`;
  }

  return cleanUrl;
}


