import axios from 'axios'
const userUrl = 'api/user'

const getUserByUserName = async(userName) => {
    const response = await axios.get(`${userUrl}`,{ params: {userName: userName}})
    return response.data;
  }

export default { getUserByUserName }