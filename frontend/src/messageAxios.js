import axios from 'axios'
const messageUrl = '/api/messages'


const getAllMessages = () => {
  const request = axios.get(messageUrl, { params: {_timestamp: new Date().getTime()}})
  return request.then(response => response.data)
};

const getMessageByUserName = async(userName) => {
  const response = await axios.get(`${messageUrl}`,{params: {userName: userName}})
  return response.data;
}

const createMessage = async(newObject) => {
  const request = await axios.post(messageUrl, newObject)
  //return request.then(response => response.data)
  return request.data;
};

const deleteMessage = id => {
  const request = axios.delete(`${messageUrl}/${id}`)
  return request.then(response => response.data)

}

export default { getAllMessages, createMessage, deleteMessage, getMessageByUserName }