import Company from "../../models/Company.schema.js";
import Attachment from "../../models/Attachment.schema.js";
import { roles } from "../../enums/role.enum.js";

export const getMyCompany = async (req, res, next) => {
  try {
    const companyId = req.user.company._id;

    const myCompany = await Company.findById(companyId, { __v: false });

    if (!myCompany) {
      return res.status(404).json({
        status: "fail",
        message: "No Company Found.",
      });
    }

    const documents = await Attachment.find({
      ownerCompany: myCompany._id,
      type: "company_document",
    }).lean();

    myCompany.documents = documents;
    console.log("My Company:", myCompany);
    return res.status(200).json({
      status: "success",
      data: await myCompany.populate([
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
  } catch (err) {
    console.error("Failed in get Company:", err.message);
    res.status(500).json({
      status: "fail",
      message: "Server error while fetching company.",
    });
  }
};
