
import apiClient from './apiClient';

//const baseUrl = '/api/motors'
const baseUrl = `/api/motors`

const getAll = () => {
  const request = apiClient.get(baseUrl)
  console.log( 'baseurl is', baseUrl)
  return request.then(response => response.data)
};

const create = newObject => {
  const config = {
    headers: { 'Content-Type': 'multipart/form-data' }
    };
    const request = apiClient.post(baseUrl, newObject, config);
  
  return request.then(response => response.data)
};


const deleteMotor = id => {
  const request = apiClient.delete( `${baseUrl}/${id}`)
  return request.then(response => response.data)
};

const getByName = name => {
  const request = apiClient.get(`${baseUrl}/${name}`)
  return request.then(response => response.data)
};

export default {getAll, create, deleteMotor, getByName }