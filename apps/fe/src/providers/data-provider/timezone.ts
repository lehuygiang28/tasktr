import { DataProvider } from '@refinedev/core';

const url = 'https://worldtimeapi.org/api/timezone';

const worldTimeAPIProvider: DataProvider & { name: string } = {
    name: 'worldTimeAPIProvider',
    getList: async ({ resource, pagination, sort, filters, metaData }) => {
        const response = await fetch(url);
        const data = await response.json();

        // Transform the data to match refine's expected format
        const formattedData = data.map((timezone: string) => ({
            id: timezone,
            name: timezone,
        }));

        return {
            data: formattedData,
            total: formattedData.length,
        };
    },
    getApiUrl: () => {
        return url;
    },
    create: async ({ resource, variables }) => {
        throw new Error('Not implemented');
    },
    update: async ({ resource, id, variables }) => {
        throw new Error('Not implemented');
    },
    deleteOne: async ({ resource, id }) => {
        throw new Error('Not implemented');
    },
    getOne: async ({ resource, id }) => {
        throw new Error('Not implemented');
    },
};

export default worldTimeAPIProvider;
