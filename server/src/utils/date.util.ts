export function stringToDateOrUndefined(str: string) {
    const date = new Date(str);
    return isNaN(date.getSeconds()) ? undefined : date;
}