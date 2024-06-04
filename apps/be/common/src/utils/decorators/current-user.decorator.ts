import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtPayloadType } from '~be/app/auth/strategies';

export const getCurrentUserByContext = (context: ExecutionContext): JwtPayloadType | null => {
    const request = context.switchToHttp().getRequest();
    return request?.user ?? null;
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
