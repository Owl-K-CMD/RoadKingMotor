import axios from 'axios'

const messageUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/messages`

const getAllMessages = async() => {
  try{
  const response = await axios.get(messageUrl, { params: {_timestamp: new Date().getTime()}})
  return response.data
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

const getMessageByUserName = async(userName) => {
  const response = await axios.get(`${messageUrl}`,{params: {userName: userName}})
  return response.data;
}

const createMessage = async(newObject) => {
  const request = await axios.post(messageUrl, newObject)
  return request.data;
};

const deleteMessage = async (id) => {
  const request = await axios.delete(`${messageUrl}/${id}`)
  return request.then(response => response.data)

}

export default { 
  getAllMessages, 
  createMessage, 
  deleteMessage, 
  getMessageByUserName }