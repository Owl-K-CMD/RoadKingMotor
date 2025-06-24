import axios from 'axios'
import { refreshAuthToken } from './refreshToken';

let onLogoutCallback = null;

const API_URL = '/api/';

  const cartAxiosInstance = axios.create({
    baseURL: API_URL,
  });

  

  cartAxiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
          }
        
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  export const setLogoutCallback = (callback) => {
    onLogoutCallback = callback;
  };



const cartService = {
  getCart: (userId) => {
    return cartAxiosInstance.get(`/cart/${userId}`)
  },

  updateCart: (userId, cartItems) => {
      return cartAxiosInstance.post(`/cart/${userId}`, { items: cartItems })
    }
      };

        let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    failedQueue = []
  }

  cartAxiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },

    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject })
          })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return cartAxiosInstance(originalRequest)
    })
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newAuthToken = await refreshAuthToken();
          processQueue(null, newAuthToken);
          originalRequest.headers['Authorization'] = 'Bearer ' + newAuthToken;
          return await cartAxiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          //window.location.href = '/login';
          if (onLogoutCallback) {
            console.log("Interceptor: Refresh token failed. Calling logout callback.");
            onLogoutCallback();
          }
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error)
    }
  );


export default cartService;