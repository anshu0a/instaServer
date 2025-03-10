const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});


const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {

        const isVideo = file.mimetype.startsWith("video/");
        return {
            folder: "insta_pic",
            resource_type: isVideo ? "video" : "auto", 
            format: isVideo ? "mp4" : undefined,      
        };
    },
});


const removeimage = async (publicId, isVideo = false) => {
    try {
        publicId = publicId.trim();
        const options = isVideo ? { resource_type: "video" } : {};
        await cloudinary.uploader.destroy(publicId, options);
    } catch (error) {
        console.error("Error deleting file:", error);
    }
};

module.exports = {
    cloudinary,
    storage,
    removeimage,
};

