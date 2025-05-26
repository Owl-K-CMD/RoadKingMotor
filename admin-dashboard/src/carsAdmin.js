
import axios from 'axios';

const baseUrl  = '/api/motors'

const getAll = () => {
  const request = axios.get(baseUrl)
  console.log('baseurl is', baseUrl)
  return request.then(response => response.data)
};

const create = newObject => {
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' }
    };
    const request = axios.post(baseUrl, newObject, config);
  
  return request.then(response => response.data)
};


const deleteMotor = id => {
  const request = axios.delete(`${baseUrl}/${id}`)
  return request.then(response => response.data)
};

const getByName = name => {
  const request = axios.get(`${baseUrl}/${name}`)
  return request.then(response => response.data)
};

export default {getAll, create, deleteMotor, getByName }