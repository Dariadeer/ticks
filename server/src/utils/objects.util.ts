export function renameKey(object: any, oldKey: string, newKey: string) {
    object[newKey] = object[oldKey];
    delete object[oldKey];
}