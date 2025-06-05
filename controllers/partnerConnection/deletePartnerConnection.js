import PartnerConnection from "../../models/PartnerConnection.js";
import { AppError } from "../../utils/AppError.js";

export const deletePartnerConnection = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const connection = await PartnerConnection.findById(req.params.id);
    if (!connection) throw new AppError("Partner connection not found", 404);
    // Only requester or recipient can delete
    if (
      connection.requester.toString() !== companyId.toString() &&
      connection.recipient.toString() !== companyId.toString()
    ) {
      throw new AppError(
        "Not authorized to delete this partner connection",
        403
      );
    }
    await connection.deleteOne();
    res.status(204).send();
  } catch (err) {
    throw new AppError(
      err.message || "Failed to delete partner connection",
      500
    );
  }
};
