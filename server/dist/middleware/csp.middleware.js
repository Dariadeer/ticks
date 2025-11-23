"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(req, res, next) {
    res.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'self' http://localhost");
    next();
}
