import Company from "../../models/Company.schema.js";
import Attachment from "../../models/Attachment.schema.js";
import { roles } from "../../enums/role.enum.js";

export const getCompanyById = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const userRole = req.user.role;

    const requiredCompany = await Company.findById(companyId, { __v: false });

    if (!requiredCompany) {
      return res.status(404).json({
        status: "fail",
        message: "No Company Found.",
      });
    }
    const documents = await Attachment.find({
      ownerCompany: requiredCompany._id,
      type: "company_document",
    }).lean();

    requiredCompany.documents = documents;

    if (userRole == roles.PLATFORM_ADMIN) {
      return res.status(200).json({
        status: "success",
        data: await requiredCompany.populate([
          {
            path: "createdBy",
            select: "name email avatar",
          },
          {
            path: "location",
            select:
              "locationName address type isActive contactPerson coordinates",
          },
        ]),
      });
    } else {
      requiredCompany.budget = undefined;
      requiredCompany.subscription = undefined;
      requiredCompany.status = undefined;
      return res.status(200).json({
        status: "success",
        data: await requiredCompany.populate([
          {
            path: "createdBy",
            select: "name email",
          },
          {
            path: "location",
            select: "locationName address",
          },
        ]),
      });
    }
  } catch (err) {
    console.error("Failed in get Company:", err.message);
    res.status(500).json({
      status: "fail",
      message: "Server error while fetching company.",
    });
  }
};
