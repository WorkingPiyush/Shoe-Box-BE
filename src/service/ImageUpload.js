import cloudinary from "../config/cloudnary.js";

function uploadImages(fileBuffer) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder: "shoe-box/products",
        }, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
        stream.end(fileBuffer);
    })
};

export default uploadImages;