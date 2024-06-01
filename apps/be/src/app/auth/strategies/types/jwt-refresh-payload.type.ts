import { User } from '../../../users/schemas';

export type JwtRefreshPayloadType = Pick<User, 'role' | 'email'> & {
    userId: string;
    iat: number;
    exp: number;
};
