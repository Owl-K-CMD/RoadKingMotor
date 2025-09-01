import axios from 'axios';

//const commentUrl = 'http://localhost:5000/api/comments';
const commentUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/comments`

const getComments = async (carId) => {
  try {
    const response = await axios.get(`${commentUrl}/car/${carId}`);
    return response.data;
  } catch (error) {

    console.error("Error fetching coments:", error);
    throw error;
  }
}
const createComments = async (comments) => {
  const request = await axios.post(commentUrl, comments)
  return request.then(response => response.data)
}


export default { getComments, createComments, }
