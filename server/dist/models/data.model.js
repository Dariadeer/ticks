"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_config_1 = __importDefault(require("../config/db.config"));
function cities() {
    return db_config_1.default.location.findMany({
        select: {
            id: true,
            name: true,
            admin_name: true
        },
        orderBy: {
            name: 'asc'
        }
    });
}
exports.default = { cities };
