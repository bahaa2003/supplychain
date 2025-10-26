import multer from "multer";
import ImageKit from "imagekit";
import { AppError } from "../utils/AppError.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log("File being filtered:", file);
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

export const uploadToImageKit = async (
  file,
  folder = "company_documents",
  companyName = "company"
) => {
  try {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const timestamp = Date.now();
    const safeCompanyName = companyName.replace(/\s+/g, "_").toLowerCase();
    const ext = file.originalname.split(".").pop();
    const customFileName = `${safeCompanyName}_${timestamp}_${randomNum}.${ext}`;

    const result = await imagekit.upload({
      file: file.buffer,
      fileName: customFileName,
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

export const deleteFromImageKit = async (fileId) => {
  try {
    const result = await imagekit.deleteFile(fileId);
    return result;
  } catch (error) {
    throw new AppError("Failed to delete file from ImageKit", 500);
  }
};
