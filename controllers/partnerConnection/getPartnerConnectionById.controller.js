import { AppError } from "../../utils/AppError.js";

export const getPartnerConnectionById = async (req, res) => {
  try {
    const connection = req.connection; // connection is fetched from middleware
    if (!connection) {
      throw new AppError("Partner connection not found", 404);
    }
    res.status(200).json({ status: "success", data: connection });
  } catch (err) {
    throw new AppError(err.message || "Failed to get partner connection", 500);
  }
};
