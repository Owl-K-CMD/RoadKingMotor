import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

// Request Interceptor: Add the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token expiration and refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 and it's not a retry request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark it as a retry to prevent infinite loops

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.error("No refresh token available. Logging out.");
            // Clear storage and redirect to login
            localStorage.clear();
            window.location.href = '/'; 
            return Promise.reject(error);
        }

        // Use a new axios instance for the refresh call to avoid an interceptor loop
        const { data } = await axios.post(`${apiClient.defaults.baseURL}/api/users/refreshToken`, {
          refreshToken: refreshToken,
        });

        // Update tokens in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Update the header for the original request and retry it
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, logout the user
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;