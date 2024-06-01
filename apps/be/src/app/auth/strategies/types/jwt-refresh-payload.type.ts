import { User } from '../../../users/schemas';

export type JwtRefreshPayloadType = Pick<User, 'role' | 'email'> & {
    userId: string;
    hash: string;
    iat: number;
    exp: number;
};
