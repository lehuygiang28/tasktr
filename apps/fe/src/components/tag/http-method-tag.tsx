import { Tag } from 'antd';
import { HttpMethodEnum } from '~be/app/tasks/tasks.enum';

export const HttpMethodTag: React.FC<{ method: HttpMethodEnum | string }> = ({ method }) => {
    let color: string;
    switch (method) {
        case HttpMethodEnum.GET:
            color = 'green';
            break;
        case HttpMethodEnum.POST:
            color = 'blue';
            break;
        case HttpMethodEnum.PUT:
            color = 'orange';
            break;
        case HttpMethodEnum.DELETE:
            color = 'red';
            break;
        case HttpMethodEnum.PATCH:
            color = 'purple';
            break;
        case HttpMethodEnum.ALL:
            color = 'geekblue';
            break;
        case HttpMethodEnum.OPTIONS:
            color = 'cyan';
            break;
        case HttpMethodEnum.HEAD:
            color = 'lime';
            break;
        case HttpMethodEnum.SEARCH:
            color = 'gold';
            break;
        case HttpMethodEnum.TRACE:
            color = 'magenta';
            break;
        default:
            color = 'default';
    }
    return <Tag color={color}>{method}</Tag>;
};
