import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL;
const SERVICE = 'menu';

export async function uploadImage({ image }) {
  // eslint-disable-next-line prefer-const
  let formData = new FormData();
  formData.append('image', image);
  const response = await axios
    .post(`${baseURL}/${SERVICE}/media/image`, formData, {
      headers: {
        timeout: 30000,
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((resp) => {
      console.log('Success', resp);
      if (resp?.data?.code === 200) {
        return resp?.data?.data;
      }
      return false;
    })
    .catch((err) => {
      console.log(err, 'ERROR');
      return false;
    });

  return response;
}
