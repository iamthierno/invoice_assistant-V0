import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Handle Postgres Invalid UUID (22P02)
    if (err.code === '22P02') {
        err.statusCode = 400;
        err.status = 'fail';
        err.message = 'Invalid ID format';
        err.isOperational = true;
    }

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    } else {
        // Production: don't leak stack traces
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            // Programming or other unknown error: don't leak details
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
                // Temporarily include error message for debugging if needed
                debug: process.env.NODE_ENV === 'test' ? err.message : undefined
            });
        }
    }
};
