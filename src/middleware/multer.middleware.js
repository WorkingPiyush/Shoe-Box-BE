import multer from 'multer';

export const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                message: "Maximum 2 images are allowed",
            });
        }

        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                message: "Each image must be less than 5 MB",
            });
        }

        return res.status(400).json({
            message: err.message,
        });
    }

    if (err?.message === "Only images files are allowed") {
        return res.status(400).json({
            message: err.message,
        });
    }

    next(err);
};