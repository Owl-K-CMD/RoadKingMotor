import axios from 'axios'
const messageUrl = '/api/messages'


const getAllMessages = () => {
  const request = axios.get(messageUrl)
  return request
};

const createMessage = async(newObject) => {
  const request = await axios.post(messageUrl, newObject)
  return request.data;
};

const deleteMessage = id => {
  const request = axios.delete(`${messageUrl}/${id}`)
  return request.then(response => response.data)

}

export default { getAllMessages, createMessage, deleteMessage }