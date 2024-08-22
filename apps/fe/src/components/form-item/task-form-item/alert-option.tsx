import { Divider, Space, Form, Checkbox, Input, Typography, Alert } from 'antd';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { useState, useEffect } from 'react';

import { TaskFormValues } from '~/components/form/task-form';

const { Item } = Form;

export type AlertOptionsProps = Readonly<{
    control: Control<TaskFormValues, NonNullable<unknown>>;
    errors: FieldErrors<TaskFormValues>;
    setValue: UseFormSetValue<TaskFormValues>;
}>;

export function AlertOptions({ control, errors, setValue }: AlertOptionsProps) {
    const [showDiscordOptions, setShowDiscordOptions] = useState<boolean | null>(null);

    useEffect(() => {
        const dmUserId = control._formValues.options?.alert?.alertOn?.discord?.dmUserId;
        const channelId = control._formValues.options?.alert?.alertOn?.discord?.channelId;

        if (dmUserId || channelId) {
            setValue('options.alert.alertOn.discord.dmUserId', dmUserId);
            setValue('options.alert.alertOn.discord.channelId', channelId);
            setShowDiscordOptions(true);
        }
    }, [control._formValues.options?.alert?.alertOn?.discord, setValue]);

    useEffect(() => {
        if (showDiscordOptions === false) {
            setValue('options.alert.alertOn.discord.dmUserId', '');
            setValue('options.alert.alertOn.discord.channelId', '');
        }
    }, [showDiscordOptions, setValue]);

    return (
        <>
            <Divider orientation="left">Notify me when</Divider>
            <Space direction="vertical">
                <Controller<TaskFormValues>
                    name={'options.alert.jobExecutionFailed'}
                    control={control}
                    render={({ field }) => (
                        <Item {...field} noStyle>
                            <Checkbox {...field} checked={field?.value == true}>
                                Job execution failed
                            </Checkbox>
                        </Item>
                    )}
                />
                <Controller<TaskFormValues>
                    name={'options.alert.disableByTooManyFailures'}
                    control={control}
                    render={({ field }) => (
                        <Item {...field} noStyle>
                            <Checkbox {...field} checked={field?.value == true}>
                                Job is disabled by too many failures
                            </Checkbox>
                        </Item>
                    )}
                />
            </Space>
            <Divider orientation="left">Notify me on:</Divider>
            <Space direction="vertical">
                <Controller<TaskFormValues>
                    name={'options.alert.alertOn.email'}
                    control={control}
                    render={({ field }) => (
                        <Item {...field} noStyle>
                            <Checkbox {...field} checked={field?.value == true}>
                                Email
                            </Checkbox>
                        </Item>
                    )}
                />
                <Checkbox
                    checked={showDiscordOptions}
                    onChange={(e) => setShowDiscordOptions(e.target.checked)}
                >
                    Discord
                </Checkbox>
                {showDiscordOptions && (
                    <>
                        <Alert
                            message={
                                <>
                                    To receive Discord notifications, please make sure our bot is
                                    allowed to send messages to you.{' '}
                                    <Typography.Link
                                        href={
                                            process.env.NEXT_DISCORD_APP_AUTHORIZE_URL ??
                                            'https://discord.com/oauth2/authorize?client_id=1276071272467660881'
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Click here
                                    </Typography.Link>{' '}
                                    to authorize.
                                </>
                            }
                            type="info"
                            showIcon
                        />
                        <Space direction="vertical">
                            <Controller<TaskFormValues>
                                name={'options.alert.alertOn.discord.dmUserId'}
                                control={control}
                                render={({ field: { ref, ...field } }) => (
                                    <Item
                                        {...field}
                                        validateStatus={
                                            errors?.options?.alert?.alertOn?.discord?.dmUserId
                                                ? 'error'
                                                : 'validating'
                                        }
                                        help={
                                            <>
                                                {
                                                    errors?.options?.alert?.alertOn?.discord
                                                        ?.dmUserId?.message
                                                }
                                            </>
                                        }
                                        noStyle
                                    >
                                        <Input
                                            {...field}
                                            value={field?.value?.toString() ?? ''}
                                            addonBefore="Send a Direct Message on Discord to user ID:"
                                            defaultValue={field?.value?.toString() ?? ''}
                                        />
                                    </Item>
                                )}
                            />
                            <Controller<TaskFormValues>
                                name={'options.alert.alertOn.discord.channelId'}
                                control={control}
                                render={({ field: { ref, ...field } }) => (
                                    <Item
                                        {...field}
                                        validateStatus={
                                            errors?.options?.alert?.alertOn?.discord?.channelId
                                                ? 'error'
                                                : 'validating'
                                        }
                                        help={
                                            <>
                                                {
                                                    errors?.options?.alert?.alertOn?.discord
                                                        ?.channelId?.message
                                                }
                                            </>
                                        }
                                        noStyle
                                    >
                                        <Input
                                            {...field}
                                            value={field?.value?.toString() ?? ''}
                                            addonBefore="Send message on Discord to channel ID:"
                                            defaultValue={field?.value?.toString() ?? ''}
                                        />
                                    </Item>
                                )}
                            />
                        </Space>
                    </>
                )}
            </Space>
        </>
    );
}
