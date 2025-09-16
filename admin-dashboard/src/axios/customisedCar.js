import axios from 'axios'

const customCarUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/customMotor`


const getCustomCar = async() => {
 const response =  await axios.get(customCarUrl)
 return response.data
}
const createCustomCar = async (customCar) => {
  const response = await axios.post(customCarUrl, customCar)
  return response.data
}

const updateCustomCar = async (id, tracks) => {
  const response = await axios.put(`${customCarUrl}/${id}/tracks`, { tracks })
  console.log('update axios is', response.data)
  return response.data
}

export default { getCustomCar, createCustomCar, updateCustomCar }
