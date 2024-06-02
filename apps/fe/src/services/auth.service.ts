import axios from '~/libs/axios';
import {
    AuthLoginPasswordlessDto,
    AuthLoginPasswordlessQueryDto,
    LoginResponseDto,
} from '~be/app/auth/dtos';

export function requestLoginPwdless({ destination }: AuthLoginPasswordlessDto) {
    const path = '/auth/login/pwdless';
    return axios.post<void>(path, { destination });
}

export function loginPwdless({ token }: AuthLoginPasswordlessQueryDto) {
    const path = '/auth/login/pwdless';
    return axios.get<LoginResponseDto>(path, {
        params: { token },
    });
}

export function refreshTokens(refreshToken: string) {
    const path = '/auth/refresh';
    return axios.post<LoginResponseDto>(path, { refreshToken });
}
