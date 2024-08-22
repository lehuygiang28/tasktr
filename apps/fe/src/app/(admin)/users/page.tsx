'use client';

import { HttpError, useInvalidate } from '@refinedev/core';
import { List, useTable, RefreshButton, ShowButton } from '@refinedev/antd';
import { Space, Table, Tag } from 'antd';

import { type UserDto } from '~be/app/users';

export default function UserList() {
    const { tableProps } = useTable<UserDto, HttpError>({
        syncWithLocation: true,
        pagination: {
            mode: 'server',
        },
        sorters: {
            mode: 'server',
            initial: [
                {
                    field: 'createdAt',
                    order: 'desc',
                },
            ],
        },
    });
    const invalidate = useInvalidate();

    return (
        <List
            headerButtons={({ defaultButtons }) => (
                <>
                    {defaultButtons}
                    <RefreshButton
                        onClick={() =>
                            invalidate({
                                resource: `users`,
                                invalidates: ['list'],
                            })
                        }
                    />
                </>
            )}
        >
            <Table<UserDto> {...tableProps}>
                <Table.Column
                    dataIndex="_id"
                    title={'Id'}
                    onFilter={(value, record) =>
                        record._id.toString().indexOf(value.toString()) === 0
                    }
                    sorter={(a: UserDto, b: UserDto) =>
                        a._id.toString().localeCompare(b._id.toString())
                    }
                    sortDirections={['descend', 'ascend']}
                />
                <Table.Column
                    dataIndex="email"
                    title={'Email'}
                    onFilter={(value, record) => record.email.indexOf(value.toString()) === 0}
                    sorter={(a: UserDto, b: UserDto) => a.email.localeCompare(b.email)}
                    sortDirections={['descend', 'ascend']}
                />
                <Table.Column
                    dataIndex="emailVerified"
                    title={'Email Verified'}
                    onFilter={(value, record) => record.emailVerified === (value === 'true')}
                    sorter={(a: UserDto, b: UserDto) =>
                        a.emailVerified === b.emailVerified ? 0 : a.emailVerified ? -1 : 1
                    }
                    sortDirections={['descend', 'ascend']}
                    render={(value) => (
                        <Tag color={value ? 'green' : 'red'}>
                            {value ? 'verified' : 'unverified'}
                        </Tag>
                    )}
                />
                <Table.Column
                    dataIndex="fullName"
                    title={'Full Name'}
                    onFilter={(value, record) => record.fullName.indexOf(value.toString()) === 0}
                    sorter={(a: UserDto, b: UserDto) => a.fullName.localeCompare(b.fullName)}
                    sortDirections={['descend', 'ascend']}
                />
                <Table.Column
                    dataIndex="role"
                    title={'Role'}
                    onFilter={(value, record) => record.role.indexOf(value.toString()) === 0}
                    sorter={(a: UserDto, b: UserDto) => a.role.localeCompare(b.role)}
                    sortDirections={['descend', 'ascend']}
                    render={(value) => (
                        <Tag color={value === 'admin' ? 'geekblue' : 'green'}>{value}</Tag>
                    )}
                />{' '}
                <Table.Column
                    title={'Actions'}
                    dataIndex="actions"
                    render={(_, record: UserDto) => (
                        <Space>
                            <ShowButton
                                hideText
                                size="small"
                                recordItemId={record._id.toString()}
                            />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
}
