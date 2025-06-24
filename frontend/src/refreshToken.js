import axios from 'axios'

const authAxios = axios.create({
  baseURL: 'http://localhost:5173/api',
  headers: { 'Content-Type': 'application/json' }
})

const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    throw new Error('No refresh token found. User needsto re_authenticate. ')
  }

  const response = await authAxios.post('/cart/refresh_token', { refreshToken });
  const { token: newAuthToken } = response.data;
  localStorage.setItem('authToken', newAuthToken);
  localStorage.setItem('refreshToken', response.data.refreshToken)
  return newAuthToken
}

export { refreshAuthToken };