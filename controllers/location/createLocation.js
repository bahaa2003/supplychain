import Location from "../../models/Location.js";

export const createLocation = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const location = await Location.create({ ...req.body, company: companyId });
    res.status(201).json({ status: "success", data: location });
  } catch (err) {
    next(err);
  }
};
