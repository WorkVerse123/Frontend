// Small resolver to route requests to mock JSON files during development
// or to the real ApiClient in production. Use VITE_USE_MOCKS to toggle.
import api from './ApiClient';
import * as Mocks from './MocksService';
import ApiEndpoints from './ApiEndpoints';

const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'true') === 'true';

// Helper: normalize a provided key or path to either a mock path or real API path.
// If caller passes a key from ApiEndpoints (string or function), use it.
// If caller passes a path beginning with '/mocks', treat as mock path always.
const resolvePath = (pathOrKey) => {
  if (!pathOrKey) return null;
  // If pathOrKey is one of ApiEndpoints values (exact match) return it
  // Allow callers to pass ApiEndpoints.* or a raw string
  if (typeof pathOrKey === 'string') {
    // If it already points to mocks, return as-is
    if (pathOrKey.startsWith('/mocks/')) return { mock: pathOrKey, api: null };
    // If it looks like an API path (starts with /), return for API
    if (pathOrKey.startsWith('/')) return { mock: null, api: pathOrKey };
  }

  // If pathOrKey is a function (like ApiEndpoints.JOB_DETAIL), caller should have executed it.
  // Try to resolve from ApiEndpoints by matching values.
  for (const key of Object.keys(ApiEndpoints)) {
    try {
      const val = ApiEndpoints[key];
      if (val === pathOrKey) return { mock: null, api: val };
    } catch (e) {}
  }

  // Fallback: return as API path
  return { mock: null, api: String(pathOrKey) };
};

const get = async (pathOrKey, config = {}) => {
  const { mock, api: apiPath } = resolvePath(pathOrKey);
  if (USE_MOCKS || mock) {
    const mockPath = mock || `/mocks/JSON_DATA/responses${apiPath}.json`;
    return Mocks.fetchMock(mockPath, config);
  }
  return api.get(apiPath, config);
};

const post = async (pathOrKey, data, config = {}) => {
  const { mock, api: apiPath } = resolvePath(pathOrKey);
  if (USE_MOCKS || mock) {
    const mockPath = mock || `/mocks/JSON_DATA/requests${apiPath}.json`;
    // For mock POSTs we just read the request file or respond with success.json
    return Mocks.fetchMock(mockPath, config).catch(() => Mocks.fetchMock('/mocks/JSON_DATA/responses/success.json'));
  }
  return api.post(apiPath, data, config);
};

const put = async (pathOrKey, data, config = {}) => {
  const { mock, api: apiPath } = resolvePath(pathOrKey);
  if (USE_MOCKS || mock) {
    const mockPath = mock || `/mocks/JSON_DATA/requests${apiPath}.json`;
    return Mocks.fetchMock(mockPath, config).catch(() => Mocks.fetchMock('/mocks/JSON_DATA/responses/success.json'));
  }
  return api.put(apiPath, data, config);
};

const del = async (pathOrKey, config = {}) => {
  const { mock, api: apiPath } = resolvePath(pathOrKey);
  if (USE_MOCKS || mock) {
    const mockPath = mock || `/mocks/JSON_DATA/requests${apiPath}.json`;
    return Mocks.fetchMock(mockPath, config).catch(() => Mocks.fetchMock('/mocks/JSON_DATA/responses/success.json'));
  }
  return api.delete(apiPath, config);
};

export default { get, post, put, del, resolvePath };
