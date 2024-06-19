import { Tag } from 'antd';

export function HttpStatusTag({ statusCode }: { statusCode: number }) {
    let color = 'green';
    if (statusCode >= 400 && statusCode < 500) {
        color = 'orange';
    } else if (statusCode >= 500 || statusCode === 0) {
        color = 'red';
    }
    return <Tag color={color}>{statusCode}</Tag>;
}
