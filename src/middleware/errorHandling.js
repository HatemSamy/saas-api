
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(err => {
            next(err);
        });
    };
};

// Global error handler
export const globalErrorHandling = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.cause || 500;
    const message = err.message || 'Internal Server Error';

    if (process.env.MOOD === "DEV") {
        res.status(statusCode).json({
            success: false,
            message,
            error: err.message,
            stack: err.stack
        });
    } else {
        res.status(statusCode).json({
            success: false,
            message,
            error: err.message
        });
    }
};
