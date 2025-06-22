import axios from 'axios'

//const API_URL =  '/api/cart'
const API_URL = 'http://localhost:5173/api';

const cartAxios = {
  getCart: (userId, token) => {
    return  axios.get(`${API_URL}/cart/${userId}`, {
      headers: { 
        Authorization: `Bearer ${token}` 
    }
    })
    .then(response => response.data);
  },
  updateCart: (userId, CartData, token) => {
    return axios.post(`${API_URL}/cart/${userId}`, CartData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => response.data);
  },
}

export default cartAxios;