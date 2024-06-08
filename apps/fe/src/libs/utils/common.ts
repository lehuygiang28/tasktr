import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

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
