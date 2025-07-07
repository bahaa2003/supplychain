import User from "../../models/User.schema.js";
import Attachment from "../../models/Attachment.schema.js";
import { AppError } from "../../utils/AppError.js";
import {
  uploadToImageKit,
  deleteFromImageKit,
} from "../../middlewares/upload.middleware.js";

export const getUserAvatar = async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) return next(new AppError("User not found", 404));

  const avatar = await Attachment.findById(user.avatar);
  if (!avatar) return next(new AppError("No avatar found for this user", 404));

  res.status(200).json({ status: "success", avatar });
};

export const updateUserAvatar = async (req, res, next) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) return next(new AppError("No file uploaded", 400));
  if (!file.mimetype.startsWith("image"))
    return next(new AppError("Only image files are allowed", 400));

  const user = await User.findById(id);

  if (!user) return next(new AppError("User not found", 404));

  // Only admin of the same company can update
  if (
    req.user.role !== "admin" ||
    user.company.toString() !== req.user.company._id.toString()
  ) {
    return next(new AppError("Unauthorized", 403));
  }

  if (user.avatar) {
    const oldAttachment = await Attachment.findById(user.avatar);
    if (oldAttachment) {
      await deleteFromImageKit(oldAttachment.fileId);
      await oldAttachment.deleteOne();
    }
  }

  const result = await uploadToImageKit(file, "user_avatars");

  const attachment = await Attachment.create({
    type: "user_avatar",
    fileUrl: result.url,
    fileId: result.fileId,
    ownerCompany: user.company,
    relatedTo: "User",
    uploadedBy: req.user._id,
    user: user._id,
  });

  user.avatar = attachment._id;
  await user.save();

  res.status(200).json({ status: "success", avatar: attachment });
};

export const deleteUserAvatar = async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) return next(new AppError("User not found", 404));

  if (
    req.user.role !== "admin" ||
    user.company.toString() !== req.user.company._id.toString()
  ) {
    return next(new AppError("Unauthorized", 403));
  }

  if (!user.avatar) return next(new AppError("No avatar to delete", 400));

  const attachment = await Attachment.findById(user.avatar);
  if (attachment) {
    await deleteFromImageKit(attachment.fileId);
    await attachment.deleteOne();
  }

  user.avatar = null;
  await user.save();

  res.status(200).json({ status: "success", message: "Avatar deleted" });
};
