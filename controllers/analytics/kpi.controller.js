import Product from "../../models/Product.js";
import Inventory from "../../models/Inventory.js";
import Order from "../../models/Order.js";
import Company from "../../models/Company.js";
import PartnerConnection from "../../models/PartnerConnection.js";
import { AppError } from "../../utils/AppError.js";

export const getCompanyKPIs = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;

    //  Company
    const company = await Company.findById(companyId);
    if (!company) return next(new AppError("Company not found", 404));

    // Products
    const products = await Product.find({ company: companyId });

    // Inventory + Inventory Value
    const inventories = await Inventory.find({ company: companyId });
    let inventoryValue = 0;
    inventories.forEach(inv => {
      const product = products.find(p => p._id.equals(inv.product));
      if (product) {
        inventoryValue += inv.onHand * product.unitPrice;
      }
    });

    //  Orders + Ordered Value
    const orders = await Order.find({ buyer: companyId });
    const orderedValue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    //  Remaining Budget
    const remainingBudget = company.budget - orderedValue;

    //  Count Stats
    const productCount = products.length;
    const orderCount = orders.length;

    //  Partner Count
    const partnerCount = await PartnerConnection.countDocuments({
      $or: [
        {
          $and: [
            {
              $or: [
                { requester: companyId },
                { recipient: companyId },
              ],
            },
            { status: { $ne: "Terminated" } },
          ],
        },
        {
          requester: companyId,
          status: "Terminated",
        }
      ]
    });

    return res.status(200).json({
      status: "success",
      data: {
        inventoryValue,
        orderedValue,
        remainingBudget,
        productCount,
        orderCount,
        partnerCount
      }
    });

  } catch (err) {
    next(new AppError(err.message || "Failed to fetch company KPIs", 500));
  }
};
