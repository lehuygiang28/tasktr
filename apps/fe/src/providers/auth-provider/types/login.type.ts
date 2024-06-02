import { AuthLoginPasswordlessQueryDto } from '~be/app/auth/dtos';

export type LoginAction = AuthLoginPasswordlessQueryDto & {
    type: 'login';
    provider: null | 'google' | 'github';
    to: null | string;
};

export type RequestLoginAction = {
    type: 'request-login';
    destination: string;
};

export type LoginActionPayload = LoginAction | RequestLoginAction;
