import axios from 'axios'
import { refreshAuthToken } from '../refreshToken'

//const commentURL = '/api/comments'
const commentURL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/comments`
let isRefreshing = false;
let failedQueue = [];
let onLogoutCallback = null;

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

export const setLogoutCallback = (callback) => {
  onLogoutCallback = callback;
};



const api = axios.create()

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
    },
  (error) => {
    return Promise.reject(error)
  }
)



const getComments = async(carId) => {
  const response = await api.get(`${commentURL}/car/${carId}`)
  return response.data
};

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config

if (error.response?.status === 401 && !originalRequest._retry) {
  if (isRefreshing) {
    return new Promise(function(resolve, reject) {
failedQueue.push({ resolve, reject })
    })
    .then(token => {
      originalRequest.headers['Authorization'] = 'Bearer ' + token
      return api(originalRequest)
    })
  }
originalRequest._retry = true;
isRefreshing = true;

try {
  const newAuthToken = await refreshAuthToken();
  processQueue(null, newAuthToken);
  originalRequest.headers['Authorization'] = 'Bearer ' + newAuthToken;
  return await api(originalRequest);
} catch (refreshError) {
  processQueue(refreshError, null);
if(onLogoutCallback) {
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
)
const createComment = async(commentData) => {
  const response = await api.post(commentURL, commentData)
  return response.data;
};


export default {getComments, createComment}