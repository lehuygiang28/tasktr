'use client';

import { CrudSort, Pagination, GetListResponse, GetListParams, BaseRecord } from '@refinedev/core';
import dataProviderSimpleRest from '@refinedev/simple-rest';
import { AxiosInstance } from 'axios';

import { GetTasksResponseDto, TaskDto } from '~be/app/tasks/dtos';

function handlePagination(searchParams: URLSearchParams, pagination?: Pagination) {
    if (pagination) {
        const { current, pageSize } = pagination;
        searchParams.set('page', String(current));
        searchParams.set('limit', String(pageSize));
    }

    return searchParams;
}

function handleFilter(searchParams: URLSearchParams, filters?: object) {
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            searchParams.set(key, String(value));
        });
    }

    return searchParams;
}

function handleSort(searchParams: URLSearchParams, sorters?: CrudSort | CrudSort[]) {
    if (sorters) {
        if (Array.isArray(sorters)) {
            if (sorters[0]?.field && sorters[0]?.order) {
                searchParams.set('sortBy', String(sorters[0]?.field));
                searchParams.set('sortOrder', String(sorters[0]?.order));
            }
        } else if (sorters.field && sorters.order) {
            searchParams.set('sortBy', sorters.field);
            searchParams.set('sortOrder', sorters.order);
        }
    }

    return searchParams;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const tasktrDataProvider = (axios: AxiosInstance) => ({
    ...dataProviderSimpleRest(API_URL, axios),
    getList: async ({
        resource,
        pagination,
        filters,
        sorters,
        meta,
    }: GetListParams): Promise<GetListResponse<BaseRecord & TaskDto>> => {
        const url = `${API_URL}/${resource}`;

        let searchParams = new URLSearchParams();
        searchParams = handlePagination(searchParams, pagination);
        searchParams = handleFilter(searchParams, filters);
        searchParams = handleSort(searchParams, sorters);

        const {
            data: { data: tasks, total },
        } = await axios.get<GetTasksResponseDto>(`${url}?${searchParams}`);

        return {
            data: tasks.map((task) => ({ ...task, id: task._id.toString() })),
            total: total,
        };
    },
});

export default tasktrDataProvider;
