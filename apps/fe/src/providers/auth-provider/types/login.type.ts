import { AuthValidatePasswordlessDto } from '~be/app/auth/dtos';

export type LoginAction = AuthValidatePasswordlessDto & {
    type: 'login';
    provider: null | 'google' | 'github';
    to: null | string;
};

export type RequestLoginAction = {
    type: 'request-login';
    email: string;
    returnUrl: string;
};

export type LoginActionPayload = LoginAction | RequestLoginAction;
