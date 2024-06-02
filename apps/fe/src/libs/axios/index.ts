import axios from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import Cookies from 'js-cookie';
import { authProvider } from '~/providers/auth-provider';
import { LoginResponseDto } from '~be/app/auth/dtos';

function getAuthData() {
    const auth = Cookies.get('auth');
    if (auth) {
        const parsedUser: LoginResponseDto = JSON.parse(auth);
        return parsedUser;
    }
    return null;
}

const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthData()?.accessToken || ''}`,
    },
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Function that will be called to refresh authorization
const refreshAuthLogic = (failedRequest: any) =>
    authProvider?.refresh().then((tokenRefreshResponse) => {
        axiosInstance.defaults.headers['Authorization'] =
            'Bearer ' + tokenRefreshResponse.tokenData?.accessToken;
        failedRequest.response.config.headers['Authorization'] =
            'Bearer ' + tokenRefreshResponse.tokenData?.accessToken;
        return Promise.resolve();
    });

// Instantiate the interceptor
createAuthRefreshInterceptor(axiosInstance, refreshAuthLogic);

export default axiosInstance;
