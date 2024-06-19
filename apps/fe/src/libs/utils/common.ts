import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { TaskLogDto } from '~be/app/task-logs';

export function formatDateToHumanReadable(date: Date | string) {
    const d = new Date(date);
    let formattedDate: string;

    switch (true) {
        case isToday(d):
            formattedDate = `Today at ${format(d, 'HH:mm:ss')}`;
            break;
        case isTomorrow(d):
            formattedDate = `Tomorrow at ${format(d, 'HH:mm:ss')}`;
            break;
        case isYesterday(d):
            formattedDate = `Yesterday at ${format(d, 'HH:mm:ss')}`;
            break;
        default:
            formattedDate = format(d, 'HH:mm:ss dd/MM/yyyy');
    }

    return formattedDate;
}

export function sortArrayByKey<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    if (!array) {
        return [];
    }
    const cloneArray = [...array];
    return cloneArray.sort((a, b) => {
        if (a[key] < b[key]) {
            return order === 'asc' ? -1 : 1;
        }
        if (a[key] > b[key]) {
            return order === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

/**
 * Get Jitter between two tasks, in seconds
 * @returns
 */
export function getJitter(taskLog: TaskLogDto) {
    const diff =
        (new Date(taskLog.executedAt).getTime() - new Date(taskLog.scheduledAt).getTime()) / 1000;
    return diff;
}
