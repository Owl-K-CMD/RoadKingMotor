import apiClient from '../apiClient'

const customCarUrl = `/api/customMotor`


const getCustomCar = async() => {
 const response =  await apiClient.get(customCarUrl)
 return response.data
}
const createCustomCar = async (customCar) => {
  const response = await apiClient.post(customCarUrl, customCar)
  return response.data
}

const updateCustomCar = async (id, tracks) => {
  const response = await apiClient.put(`${customCarUrl}/${id}/tracks`, { tracks })
  console.log('update axios is', response.data)
  return response.data
}

export default { getCustomCar, createCustomCar, updateCustomCar }
