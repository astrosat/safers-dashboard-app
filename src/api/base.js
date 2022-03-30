import axios from 'axios'
import { authHeader } from '../helpers/authHelper';
import { BASE_URL } from '../config';

const API_PREFIX = 'api';

const axiosApi = axios.create({
  baseURL: `${BASE_URL}/${API_PREFIX}`,
})

axiosApi.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
)

export async function get(url, params = {}, config = {}) {
  
  return await axiosApi.get(url, { params: params }, { ...config, headers: authHeader() }).then(response => response)
}

export async function patch(url, data, config = {}) {
  return await axiosApi.patch(url, { ...data }, { ...config, headers: authHeader() })
    .then(response => response)
    .catch(error => error.response);
}

export async function post(url, data, config = {}) {
  return axiosApi
    .post(url, { ...data }, { ...config, headers: authHeader() })
    .then(response => response)
    .catch(error => error.response);
}

export async function put(url, data, config = {}) {
  return axiosApi
    .put(url, { ...data }, { ...config, headers: authHeader() })
    .then(response => response)
}

export async function del(url, config = {}) {
  return await axiosApi
    .delete(url, { ...config, headers: authHeader() })
    .then(response => response)
}

export function isSuccessResp(status) {
  //2xx Status Codes [Success]
  if(status >= 200 && status <= 299){
    return true;
  }
  return false;
}
