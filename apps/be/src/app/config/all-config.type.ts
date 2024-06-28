import { type AppConfig } from './app-config.type';
import { type AuthConfig } from '~be/app/auth/config';
import { type TasksConfig } from '~be/app/tasks/config';
import { type MailConfig } from '~be/common/mail/config';

export type AllConfig = {
    app: AppConfig;
    auth: AuthConfig;
    tasks: TasksConfig;
    mail: MailConfig;
};
