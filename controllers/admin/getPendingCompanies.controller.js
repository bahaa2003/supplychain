import Company from "../../models/Company.js";

export const getPendingCompanies = async (req, res, next) => {
  const companies = await Company.find(
    { isApproved: false },
    { __v: false }
  ).populate("createdBy", "name email isEmailVerified");
  console.log("Pending companies:", companies);
  const activeuser = companies.filter(
    (company) => company.createdBy && company.createdBy.isEmailVerified
  );
  if (activeuser.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No pending companies found.",
    });
  }
  res.status(200).json({
    status: "success",
    results: companies.length,
    data: activeuser,
  });
};
