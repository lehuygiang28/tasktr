import axios from 'axios';

const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default axiosInstance;
