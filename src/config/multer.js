import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        files: 2,
        fileSize: 5 * 1024 * 1024, // max 5 MB only
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images files are allowed"));
        }
    }
})

export default upload;