import PartnerConnection from "../../models/PartnerConnection.js";
import { AppError } from "../../utils/AppError.js";

export const createPartnerConnection = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const { recipient, partnershipType, visibilitySettings, notes } = req.body;
    if (!recipient || !partnershipType) {
      throw new AppError("Recipient and partnershipType are required", 400);
    }
    // Prevent duplicate requests
    const exists = await PartnerConnection.findOne({
      requester: companyId,
      recipient,
      partnershipType,
      status: { $in: ["Pending", "Accepted"] },
    });
    if (exists) {
      throw new AppError(
        "A similar partner connection already exists or is pending",
        409
      );
    }
    const partnerConnection = await PartnerConnection.create({
      requester: companyId,
      recipient,
      partnershipType,
      visibilitySettings,
      notes,
      invitedBy: req.user._id,
    });
    res.status(201).json({ status: "success", data: partnerConnection });
  } catch (err) {
    throw new AppError(
      err.message || "Failed to create partner connection",
      500
    );
  }
};
