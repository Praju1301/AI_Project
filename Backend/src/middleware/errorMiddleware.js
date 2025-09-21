/**
 * Middleware that handles requests to routes that do not exist.
 * It creates a 404 error and passes it to the main error handler.
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass the error to the next middleware in the chain
};

/**
 * The main error handler for the application.
 * It catches all errors passed by `next(error)` and sends a formatted JSON response.
 */
const errorHandler = (err, req, res, next) => {
    // If the status code is still 200 (OK), it means an error was thrown without setting a specific status.
    // In that case, default to 500 (Internal Server Error).
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        // For security, only show the detailed error stack if the app is in 'development' mode.
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };