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

/**
 * Upload directly to Cloudinary (unsigned) then notify backend to save the link.
 * - fileOrUrl: string (already-hosted URL) | File | Blob | FileList
 * - opts: { onProgress?: (percent) => void, cloudName?: string, uploadPreset?: string }
 *
 * Uses import.meta.env.VITE_CLOUDINARY_CLOUD_NAME and
 * import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET by default if not provided in opts.
 */
function uploadImageToCloudinary(fileOrUrl, opts = {}) {
  const { onProgress, cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET } = opts;

  if (!fileOrUrl) throw new Error('No file or url provided');

  if (typeof fileOrUrl === 'string') {
    return Promise.resolve({ url: fileOrUrl, raw: null });
  }

  let file = fileOrUrl;
  if (typeof File !== 'undefined' && fileOrUrl instanceof FileList) file = fileOrUrl[0];

  if (!(file instanceof Blob) && !(typeof File !== 'undefined' && file instanceof File)) {
    throw new Error('uploadImageToCloudinary expects a File/Blob or a URL string');
  }

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your environment or pass them via opts.');
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        try {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        } catch (err) {
          // ignore progress callback errors
        }
      };
    }

    xhr.onerror = () => reject(new Error('Network error during Cloudinary upload'));

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let res;
        try {
          res = JSON.parse(xhr.responseText);
        } catch (e) {
          return reject(e);
        }

        const secureUrl = res?.secure_url || res?.url || null;
        if (!secureUrl) return reject(new Error('Upload succeeded but Cloudinary response did not include secure_url'));

        // By default, return the Cloudinary url + raw response and let caller decide how to save it.
        const result = { url: secureUrl, raw: res };

        // Optional: if caller wants the service to save the URL along with other FE data,
        // they can pass opts.saveToBackend = true and provide opts.dataToSave (object) which
        // will be merged with the url under the key opts.fieldName (default 'avatarUrl').
        const { saveToBackend = false, backendPath = '/api/uploads', dataToSave = null, fieldName = 'avatarUrl' } = opts;

        if (saveToBackend && dataToSave && typeof dataToSave === 'object') {
          const body = { ...dataToSave, [fieldName]: secureUrl };
          api.post(backendPath, body)
            .then((beRes) => resolve({ ...result, backend: beRes?.data ?? beRes }))
            .catch((err) => reject(err));
        } else {
          resolve(result);
        }
      } else {
        let errMsg = `Upload failed with status ${xhr.status}`;
        try {
          const body = JSON.parse(xhr.responseText || '{}');
          if (body?.error) errMsg += `: ${body.error}`;
        } catch (e) {
          // ignore parse
        }
        reject(new Error(errMsg));
      }
    };

    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', uploadPreset);

    try {
      xhr.send(form);
    } catch (sendErr) {
      reject(sendErr);
    }
  });
}

export default { uploadImage, uploadImageToCloudinary };
