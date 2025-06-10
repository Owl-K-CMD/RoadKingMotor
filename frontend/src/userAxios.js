import axios from 'axios'

const userUrl = 'api/user'

const createUser = async (user) => {
  const response = await axios.post(userUrl, user)
  return response.data
}

const getAllUsers = async() => {
  const response = await axios.get(userUrl)
  return response.data;
}

const getUserByUserName = async(userName) => {
    const response = await axios.get(`${userUrl}`,{ params: {userName: userName}})
    return response.data;
  }

export default {
  createUser,
  getAllUsers,
  getUserByUserName

}