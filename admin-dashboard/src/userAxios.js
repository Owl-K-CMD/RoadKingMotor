import apiClient from './apiClient'

const adminUrl = `/api/admin`

const getUserByUserName = async(name) => {
    const response = await apiClient.get(`${adminUrl}`,{ params: {name: name}})
    return response.data;
  }


  const loginUser = async(credentials) => {
    const response = await apiClient.post(`${adminUrl}/login`, credentials)
    return response.data;
  }

export default {
  loginUser,
  getUserByUserName
}