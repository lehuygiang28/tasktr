import { Dispatch, useEffect, useReducer } from 'react';

/**
 * Custom hook to update cron value and input value.
 *
 * Cannot use InputRef to update the value because of a change in antd 4.19.0.
 *
 * @param defaultValue - The default value of the input and cron component.
 * @returns - The cron and input values with the dispatch function.
 */
export function useCronReducer({
    defaultValue,
    setFormValue,
}: {
    defaultValue: string;
    setFormValue?: (value: string) => void;
}): [
    {
        inputValue: string;
        cronValue: string;
    },
    Dispatch<{
        type: 'set_cron_value' | 'set_input_value' | 'set_values';
        value: string;
    }>,
] {
    const [values, dispatchValues] = useReducer(
        (
            prevValues: {
                inputValue: string;
                cronValue: string;
            },
            action: {
                type: 'set_cron_value' | 'set_input_value' | 'set_values';
                value: string;
            },
        ) => {
            switch (action.type) {
                case 'set_cron_value':
                    return {
                        inputValue: prevValues.inputValue,
                        cronValue: action.value,
                    };
                case 'set_input_value':
                    return {
                        inputValue: action.value,
                        cronValue: prevValues.cronValue,
                    };
                case 'set_values':
                    return {
                        inputValue: action.value,
                        cronValue: action.value,
                    };
            }
        },
        {
            inputValue: defaultValue,
            cronValue: defaultValue,
        },
    );

    useEffect(() => {
        if (typeof setFormValue === 'function' && values.inputValue) {
            setFormValue(values.inputValue);
        }
    }, [values.inputValue, setFormValue]);

    return [values, dispatchValues];
}
