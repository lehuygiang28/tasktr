import { parseExpression } from 'cron-parser';

export type CronInput = {
    cronExpression: string;
    timeZone?: string;
};

export type CronValidationOptions = {
    minIntervalInSeconds: number;
    numTasks: number;
};

export type CronError = {
    message: string;
    err: string;
};

export function validateCronFrequency(
    input: CronInput,
    options: CronValidationOptions,
): true | CronError {
    try {
        // Parse the cron expression
        const interval = parseExpression(input.cronExpression, {
            tz: input?.timeZone ?? process.env.TZ,
        });

        // Get the next numTasks+1 occurrences
        const dates = [];
        for (let i = 0; i < options.numTasks + 1; i++) {
            dates.push(interval.next().toDate());
        }

        // Calculate the difference in seconds between the first and last occurrence
        const difference = (dates[options.numTasks].getTime() - dates[0].getTime()) / 1000;
        console.log('difference ', difference);

        // Check if the difference is less than the minimum interval
        if (difference < options.minIntervalInSeconds) {
            return {
                message: `Tasks cannot run more frequently than ${options.numTasks} tasks every ${options.minIntervalInSeconds} seconds. Your task is running every ${difference} seconds.`,
                err: 'taskTooFrequent',
            };
        }

        return true;
    } catch (error) {
        return {
            message: 'Invalid cron expression.',
            err: 'invalidCron',
        };
    }
}

export function getNextJobTimes(input: CronInput, num = 3): Date[] | CronError {
    try {
        // Parse the cron expression
        const interval = parseExpression(input.cronExpression, {
            tz: input?.timeZone ?? process.env.TZ,
        });

        // Get the next num occurrences
        const dates = [];
        for (let i = 0; i < num; i++) {
            dates.push(interval.next().toDate());
        }

        return dates;
    } catch (error) {
        return {
            message: 'Invalid cron expression.',
            err: 'invalidCron',
        };
    }
}
