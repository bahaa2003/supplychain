import dotenv from "dotenv";
dotenv.config();

import multer from "multer";
import ImageKit from "imagekit";
import { AppError } from "../utils/AppError.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new AppError("Only image or PDF files are allowed!", 400), false);
    }
  },
});

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadToImageKit = async (file, folder = "company_documents") => {
  try {
    const result = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder,
    });
    return {
      url: result.url,
      fileId: result.fileId,
    };
  } catch (error) {
    throw new AppError(error.message, 500);
  }
};
