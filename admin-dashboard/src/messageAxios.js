import axios from 'axios'

const messageUrl = 'api/messages'


const getMessage = () => {
 const request =  axios.get(messageUrl)
 return request.then(response => response.data)
}
const createMessage = (message) => {
  const request = axios.post(messageUrl, message)
  return request.then(response => response.data)
}


export default { getMessage, createMessage, }
