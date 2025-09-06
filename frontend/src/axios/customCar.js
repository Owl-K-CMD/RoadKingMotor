import axios from 'axios'

const baseUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/customMotor`

const getCustom = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const getCustomCarByUserId = async (userId) => {
  const response = await axios.get(`${baseUrl}/user/${userId}`);
  return response.data;
};


const createCustom = async (newObject) => {
  const response = await axios.post(baseUrl, newObject)
  return response.data
}

const deleteCustom = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`)
  return response.data
}
export default { 
  getCustom, 
  createCustom, 
  deleteCustom, 
  getCustomCarByUserId
 }