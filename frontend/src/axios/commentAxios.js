import axios from 'axios'

const commentURL = 'api/comments'

const fetchComments = async(carId) => {
  const response = await axios.get(`${commentURL}/car/${carId}`)
  return response.data
};

const createComment = async(carId, commentData) => {

  const response = await axios.post(`${commentURL}/car/${carId}`, commentData)
  return response.data
};



export default {
  fetchComments,
  createComment

}