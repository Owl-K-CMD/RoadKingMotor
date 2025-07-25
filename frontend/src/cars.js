import axios from 'axios'

//const baseUrl  = '/api/motors'
const baseUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/api/motors`

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
};

const create = newObject => {
  const request = axios.post(baseUrl, newObject)
  return request.then(response => response.data)
  
};

const deleteMotor = id => {
  const request = axios.delete(`${baseUrl}/${id}`)
  return request.then(response => response.data)
};

const getByName = name => {
  const request = axios.get(`${baseUrl}/name/${name}`)
  return request.then(response => response.data)
};

const getById = (id) => {
  const request = axios.get(`${baseUrl}/${id}`);
  return request.then(response => response.data);
};


export default {
  getAll,
   create,
   deleteMotor,
   getByName,
   getById
}