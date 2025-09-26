import api from './ApiClient';

/**
 * UploadService
 * - uploadImage(fileOrUrl, opts)
 *    - If `fileOrUrl` is a string, it's treated as an already-hosted URL and returned as-is.
 *    - If `fileOrUrl` is a File/Blob, it's uploaded to POST /api/uploads and the hosted URL is returned.
 *
 * Returns a normalized object: { url: string, raw: any }
 * Accepts an optional `onProgress(percent:number)` callback in opts.
 */
async function uploadImage(fileOrUrl, opts = {}) {
  const { onProgress } = opts;

  if (!fileOrUrl) throw new Error('No file or url provided');

  // If caller passed an URL string, just return it (no upload needed)
  if (typeof fileOrUrl === 'string') {
    return { url: fileOrUrl, raw: null };
  }

  // support File, Blob, or FileList (take first)
  let file = fileOrUrl;
  if (typeof File !== 'undefined' && fileOrUrl instanceof FileList) file = fileOrUrl[0];

  if (!(file instanceof Blob) && !(typeof File !== 'undefined' && file instanceof File)) {
    throw new Error('uploadImage expects a File/Blob or a URL string');
  }

  const form = new FormData();
  form.append('file', file);

  try {
    const res = await api.post('/api/uploads', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // axios supports onUploadProgress; pass through if api is axios-based
      onUploadProgress: (progressEvent) => {
        try {
          if (onProgress && progressEvent && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress(percent);
          }
        } catch (e) {
          // ignore progress callback errors
        }
      },
    });

    const data = res?.data ?? res;

    // Try common locations for hosted url
    const candidates = [
      data?.data?.url,
      data?.url,
      data?.path,
      data?.data?.path,
      data?.data?.fileUrl,
      data?.fileUrl,
    ];

    const url = candidates.find((v) => v && typeof v === 'string') ?? null;

    if (!url) {
      // As a fallback, if server returned a string directly
      if (typeof data === 'string') return { url: data, raw: data };
      // no usable url found
      throw new Error('Upload succeeded but no file URL was found in the server response');
    }

    return { url, raw: data };
  } catch (err) {
    // rethrow so callers can show UI errors
    throw err;
  }
}

export default { uploadImage };
