"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToDateOrUndefined = stringToDateOrUndefined;
function stringToDateOrUndefined(str) {
    const date = new Date(str);
    return isNaN(date.getSeconds()) ? undefined : date;
}
