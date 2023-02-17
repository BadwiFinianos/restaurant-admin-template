import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL;

const addDonorAPI = async (data) => {
  console.log('ADDING', data);
  const { data: response } = await axios.post(`${baseURL}/donors/`, data);
  return response;
};

export { addDonorAPI };
