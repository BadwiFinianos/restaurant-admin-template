import { useState } from 'react';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material';

export const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

const AxiosInterceptor = ({ children }) => {
  const [error, setError] = useState(null);

  // Response interceptor
  axiosInstance.interceptors.response.use(({ data: responseData, status: responseStatus }) => {
    if (!responseData || responseStatus === 400) {
      // Do something here with Hooks or something else
      setError('APIError');
      throw new Error('APIError');
    }
    const { code, data } = responseData;
    if (code === 200) {
      return data;
    }
    if (code === 400) {
      // HandleError
      setError(typeof data === 'string' ? data : 'APIError');
      throw new Error(typeof data === 'string' ? data : 'APIError');
    }

    return responseData;
  });

  return (
    <>
      <Snackbar
        open={!!error}
        autoHideDuration={10000}
        onClose={() => {
          setError(null);
        }}
      >
        <Alert
          severity="error"
          onClose={() => {
            setError(null);
          }}
        >
          {error?.message || error}
        </Alert>
      </Snackbar>
      {children}
    </>
  );
};

export default AxiosInterceptor;
