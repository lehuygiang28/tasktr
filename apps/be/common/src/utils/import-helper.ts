export async function importESM<T>(packageName: string): Promise<Awaited<T>> {
    const module = await (eval(`import('${packageName}')`) as Promise<T>);
    return module;
}
