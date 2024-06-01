/**
 * Sorts and stringifies an argument
 * @param arg The argument to be sorted and stringified
 * @returns The sorted and stringified argument as a string
 */
export function sortedStringify(arg: unknown): string {
    if (typeof arg !== 'object' || arg === null || arg === undefined) {
        return JSON.stringify(arg);
    }

    if (Array.isArray(arg)) {
        return '[' + arg.map(sortedStringify).join(',') + ']';
    }

    const keys = Object.keys(arg as object).sort((a, b) => a.localeCompare(b));
    const keyValuePairs = keys.map((key) => {
        const value = sortedStringify((arg as { [key: string]: unknown })[key]);
        return '"' + key + '":' + value;
    });
    return '{' + keyValuePairs.join(',') + '}';
}

/**
 *
 * @param stringValue The string value to check if it is true
 * @returns true if the string value is true, otherwise false
 * @description true value: true
 */
export function isTrueSet(stringValue: string | boolean) {
    return !!stringValue && String(stringValue)?.toLowerCase()?.trim() === 'true';
}
