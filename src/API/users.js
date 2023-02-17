import { axiosInstance } from '../utils/AxiosInterceptor';

const SERVICE = 'users';
const MODEL = 'user';
const baseURL = process.env.REACT_APP_API_URL;

const add = async (data) => axiosInstance.post(`${baseURL}/${SERVICE}/${MODEL}`, data);

const get = async (id) => axiosInstance.get(`${baseURL}/${SERVICE}/${MODEL}/${id}`);

const update = async (id, data) => axiosInstance.put(`${baseURL}/${SERVICE}/${MODEL}/${id}`, data);

const getAll = async (lastItemID) => axiosInstance.get(`${baseURL}/${SERVICE}/${MODEL}`, { params: { lastItemID } });

const remove = async (id) => axiosInstance.delete(`${baseURL}/${SERVICE}/${MODEL}/${id}`);

export { add, get, update, remove, getAll };
