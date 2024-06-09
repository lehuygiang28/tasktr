'use client';

import { GetListResponse, GetListParams, BaseRecord } from '@refinedev/core';
import dataProviderSimpleRest from '@refinedev/simple-rest';
import { AxiosInstance } from 'axios';
import { handleFilter, handlePagination, handleSort } from '~/libs/utils/data-provider.util';

import { GetTasksResponseDto, TaskDto } from '~be/app/tasks/dtos';

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
