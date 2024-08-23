import { TaskLogDto } from '~be/app/task-logs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

dayjs.extend(tz);
dayjs.extend(utc);

export function formatDateToHumanReadable(
    date: Date | string,
    { timezone, ms }: { timezone?: string; ms?: boolean } = { ms: false, timezone: null },
) {
    const format = ms ? 'HH:mm:ss:SSS DD/MM/YYYY' : 'HH:mm:ss DD/MM/YYYY';
    return timezone ? dayjs(date).tz(timezone).format(format) : dayjs(date).format(format);
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

export function camelCaseToCapitalizedWords(str: string) {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
}
