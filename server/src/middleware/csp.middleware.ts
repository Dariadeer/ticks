import { Request, Response, NextFunction } from "express";

export default function(req: Request, res: Response, next: NextFunction) {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; connect-src 'self' http://localhost"
    );
    next();
}