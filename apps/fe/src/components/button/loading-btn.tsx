import { Button, ButtonProps } from 'antd';
import { ReactNode, useState, MouseEvent as ReactMouseEvent } from 'react';

export type LoadingBtnProps = { content: ReactNode; isValid?: boolean } & Omit<
    ButtonProps,
    'loading'
>;

export default function LoadingBtn({ content, onClick, isValid, ...props }: LoadingBtnProps) {
    const [loading, setLoading] = useState(false);

    const enterLoading = async (e: ReactMouseEvent<HTMLElement>) => {
        if (isValid) {
            setLoading(true);
            const minLoadingTimePromise = new Promise((resolve) => setTimeout(resolve, 3000)); // 3 second minimum loading time
            await Promise.all([minLoadingTimePromise]);
            setLoading(false);
        }

        onClick?.(e);
    };

    return (
        <Button loading={loading} onClick={enterLoading} {...props}>
            {content}
        </Button>
    );
}
