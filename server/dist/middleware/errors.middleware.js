"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
function errorHandler(err, req, res, next) {
    if (err) {
        const status = err.status || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ error: message });
    }
}
