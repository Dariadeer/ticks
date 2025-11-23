export default function errorHandler(err: any, req: any, res: any, next: any) {
    if(err) {
        const status = err.status || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ error: message });
    }

    
}