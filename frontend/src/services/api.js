export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ensure Content-Type is set for JSON bodies if not explicitly omitted
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Prefix URL with http://localhost:5000 if it's a relative path starting with /api
  const finalUrl = url.startsWith('/') ? `http://localhost:5000${url}` : url;

  const response = await fetch(finalUrl, {
    ...options,
    headers,
  });

  return response;
};
