import { sortedStringify } from '../common';

export class AbstractService {
    public CACHE_PREFIX = 'CACHE_BASE';

    constructor(cachePrefix: string) {
        this.CACHE_PREFIX = cachePrefix;
    }

    /**
     * Builds a cache key based on the function name and its arguments.
     *
     * @param {string} fnName - The name of the function.
     * @param {...unknown[]} args - The arguments passed to the function.
     * @return {string} The cache key.
     */
    public buildCacheKey(fnName: string, ...args: unknown[]): string {
        return `${this.CACHE_PREFIX}_${fnName}:${sortedStringify(args)}`;
    }
}
