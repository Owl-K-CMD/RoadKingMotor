import apiClient from './apiClient';

//const commentUrl = 'http://localhost:5000/api/comments';
const commentUrl = `/api/comments`

const getComments = async (carId) => {
  try {
    const response = await apiClient.get(`${commentUrl}/car/${carId}`);
    return response.data;
  } catch (error) {

    console.error("Error fetching coments:", error);
    throw error;
  }
}
const createComments = async (comments) => {
  const request = await apiClient.post(commentUrl, comments)
  return request.then(response => response.data)
}


export default { getComments, createComments, }
