import { User } from '../../../users/schemas';

export type JwtPayloadType = Pick<User, 'role' | 'email'> & {
    userId: string;
    iat: number;
    exp: number;
};
