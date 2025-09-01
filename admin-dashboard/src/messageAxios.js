import axios from 'axios'

//const messageUrl = 'api/messages'
const messageUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/messages`


const getMessage = async() => {
 const response =  await axios.get(messageUrl)
 return response.data
}
const createMessage = async (message) => {
  const response = await axios.post(messageUrl, message)
  return response.data
}


export default { getMessage, createMessage, }
