import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agri-products', // Cloudinary folder name
        // allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'], // Removed to allow all formats Cloudinary supports
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }], // Optional: resize large images
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export default upload;
