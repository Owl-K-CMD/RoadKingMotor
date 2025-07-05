import axios from 'axios'

const authAxios = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    throw new Error('No refresh token found. User needsto re_authenticate. ')
  }

  const response = await authAxios.post('/user/refreshToken', { refreshToken });
  const { token: newAuthToken, refreshToken: newRefreshToken } = response.data;
  localStorage.setItem('authToken', newAuthToken);
  localStorage.setItem('refreshToken', newRefreshToken)
  return newAuthToken
}

export { refreshAuthToken };