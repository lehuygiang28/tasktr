import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Input, Row, Space } from 'antd';
import React, { useState } from 'react';
import { Control, Controller, useFieldArray } from 'react-hook-form';
import { TaskFormValues } from '~/components/form/task-form';

const { Item } = Form;

export type HeadersOptionProps = {
    control: Control<TaskFormValues, NonNullable<unknown>>;
};

export function HeadersOption({ control }: HeadersOptionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'headerLists',
    });

    const [showValues, setShowValues] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    return (
        <>
            <Item label="Headers">
                <div>
                    {fields.map((field, index) => (
                        <Row key={field.id} gutter={16} style={{ marginBottom: 8 }}>
                            <Col span={11}>
                                <Controller
                                    name={`headerLists.${index}.key`}
                                    control={control}
                                    rules={{ required: 'Key is required' }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            placeholder="Key"
                                            onFocus={() => setFocusedIndex(index)}
                                            onBlur={() => setFocusedIndex(null)}
                                        />
                                    )}
                                />
                            </Col>
                            <Col span={11}>
                                <Controller
                                    name={`headerLists.${index}.value`}
                                    control={control}
                                    rules={{ required: 'Value is required' }}
                                    render={({ field }) => (
                                        <Input.Password
                                            {...field}
                                            placeholder="Value"
                                            visibilityToggle={{
                                                visible: showValues || focusedIndex === index,
                                            }}
                                            onFocus={() => setFocusedIndex(index)}
                                            onBlur={() => setFocusedIndex(null)}
                                        />
                                    )}
                                />
                            </Col>
                            <Col span={2}>
                                <Space>
                                    <MinusCircleOutlined onClick={() => remove(index)} />
                                </Space>
                            </Col>
                        </Row>
                    ))}
                </div>
                <Space>
                    <Button
                        type="dashed"
                        onClick={() => append({ key: '', value: '' })}
                        block
                        icon={<PlusOutlined />}
                    >
                        Add Header
                    </Button>
                    <Checkbox
                        checked={showValues}
                        onChange={(e) => setShowValues(e?.target?.checked)}
                        disabled={focusedIndex !== null}
                    >
                        Show Values
                    </Checkbox>
                </Space>
            </Item>
        </>
    );
}
