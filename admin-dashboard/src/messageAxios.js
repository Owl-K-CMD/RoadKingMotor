import apiClient from './apiClient'

const messageUrl = `/api/messages`


const getMessage = async() => {
 const response =  await apiClient.get(messageUrl)
 return response.data
}
const createMessage = async (message) => {
  const response = await apiClient.post(messageUrl, message)
  return response.data
}


export default { getMessage, createMessage, }
