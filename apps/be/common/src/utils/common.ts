import { Condition, ObjectId, Types, isValidObjectId } from 'mongoose';

export function convertToObjectId(
    input: string | Types.ObjectId | Uint8Array | number | Condition<ObjectId>,
): Types.ObjectId {
    if (!isValidObjectId(input)) {
        throw new Error(`Invalid object id: ${input}`);
    }
    return new Types.ObjectId(input);
}

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

/**
 * Returns an array of keys from the given enum object.
 *
 * @param {T} enumObj - The enum object from which to extract the keys.
 * @return {string[]} An array of keys from the enum object.
 * @template T - The type of the enumeration.
 */
export function keysOfEnum<T extends object>(enumObj: T): string[] {
    const keys = Object.keys(enumObj).filter((k) => isNaN(Number(k)));
    return keys;
}

/**
 * Returns an array of values from the given enum object.
 *
 * @param {T} enumObj - The enum object from which to extract the values.
 * @return {(string | number)[]} An array of values from the enum object.
 * @template T - The type of the enumeration.
 */
export function valuesOfEnum<T extends object>(enumObj: T): (string | number)[] {
    const values = keysOfEnum(enumObj).map(
        (k) => enumObj[k as keyof T] as unknown as string | number,
    );

    return values;
}
