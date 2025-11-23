"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameKey = renameKey;
function renameKey(object, oldKey, newKey) {
    object[newKey] = object[oldKey];
    delete object[oldKey];
}
