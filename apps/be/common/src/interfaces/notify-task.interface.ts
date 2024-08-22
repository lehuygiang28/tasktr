import { ErrorNotificationEnum } from '~be/app/tasks/enums';

type NotifyStopTask = {
    to: string;
    data: Record<string, string | number | boolean>;
    typeNotify: ErrorNotificationEnum;
} & Record<string, string | number | boolean>;

export interface NotifyTask {
    notifyStopTask: (data: NotifyStopTask) => void;
}
