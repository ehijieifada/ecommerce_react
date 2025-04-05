import multer from "multer";
import { memoryStorage } from "multer";

// Use memory storage to keep files in memory before sending to Cloudinary
const storage = memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept image files only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: limit to 5MB
});

export default upload;
