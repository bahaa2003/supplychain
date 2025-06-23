import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../services/notification.service.js";
import Inventory from "../../models/Inventory.js";
import InventoryHistory from "../../models/InventoryHistory.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";

export const updateOrderStatus = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);
    if (order.supplier.toString() !== companyId.toString()) {
      throw new AppError("Not authorized to update this order", 403);
    }

    if (["Confirmed", "Completed"].includes(status)) {
      // Check inventory for each product in the order
      for (const item of order.items) {
        const inventory = await Inventory.findOne({
          product: item.product,
          company: order.supplier,
        });
        if (!inventory || inventory.currentQuantity < item.quantity) {
          throw new AppError(
            `Insufficient inventory for product ${item.product}`,
            400
          );
        }
      }
      // Deduct inventory and record in InventoryHistory
      for (const item of order.items) {
        const inventory = await Inventory.findOne({
          product: item.product,
          company: order.supplier,
        });
        const previousQuantity = inventory.currentQuantity;
        inventory.currentQuantity -= item.quantity;
        await inventory.save();
        await InventoryHistory.create({
          inventory: inventory._id,
          changeType: "Order Deduction",
          quantityChange: -item.quantity,
          previousQuantity,
          newQuantity: inventory.currentQuantity,
          reason: "Order fulfillment",
          referenceType: "Order",
          referenceId: order._id,
          performedBy: req.user._id,
        });
      }
      // When order is completed, create or link product at buyer and add new inventory
      if (status === "Completed") {
        for (const item of order.items) {
          let buyerProduct = await Product.findOne({
            company: order.buyer,
            relatedProducts: item.product,
          });
          const supplierProduct = await Product.findById(item.product);
          // If no related product found, create a new product at the buyer
          if (!buyerProduct) {
            buyerProduct = await Product.findOne({
              company: order.buyer,
              name: supplierProduct.name,
            });
            if (buyerProduct) {
              // relatedProducts already exists, just add the supplier product
              if (!buyerProduct.relatedProducts.includes(item.product)) {
                buyerProduct.relatedProducts.push(item.product);
                await buyerProduct.save();
              }
              if (!supplierProduct.relatedProducts.includes(buyerProduct._id)) {
                supplierProduct.relatedProducts.push(buyerProduct._id);
                await supplierProduct.save();
              }
              // if no product found, create a new product at the buyer
            } else {
              buyerProduct = await Product.create({
                name: supplierProduct.name,
                company: order.buyer,
                sku: `SKU-${Math.random()
                  .toString(36)
                  .substring(2, 14)
                  .toUpperCase()}`,
                description: supplierProduct.description,
                category: supplierProduct.category,
                unit: supplierProduct.unit,
                weight: supplierProduct.weight,
                dimensions: supplierProduct.dimensions,
                tags: supplierProduct.tags,
                relatedProducts: [item.product],
              });
              // relatedProducts at buyer
              supplierProduct.relatedProducts.push(buyerProduct._id);
              await supplierProduct.save();
            }
          }
          // Add new inventory for the product at the buyer
          let buyerInventory = await Inventory.findOne({
            product: buyerProduct._id,
            company: order.buyer,
          });
          if (!buyerInventory) {
            buyerInventory = await Inventory.create({
              product: buyerProduct._id,
              company: order.buyer,
              currentQuantity: item.quantity,
            });
          } else {
            buyerInventory.currentQuantity += item.quantity;
            await buyerInventory.save();
          }
          await InventoryHistory.create({
            inventory: buyerInventory._id,
            changeType: "Order Receive",
            quantityChange: item.quantity,
            previousQuantity: buyerInventory.currentQuantity - item.quantity,
            newQuantity: buyerInventory.currentQuantity,
            reason: "Order received",
            referenceType: "Order",
            referenceId: order._id,
            performedBy: req.user._id,
          });
        }
      }
    }
    order.status = status;
    await order.save();

    // Get buyer company users with admin or manager role
    const recipients = await User.find({
      company: order.buyer,
      role: { $in: ["admin", "manager"] },
    });

    // Send notification to buyer about status change
    await createNotification(
      "orderStatusChange",
      {
        orderNumber: order.orderNumber,
        newStatus: status,
      },
      recipients
    );

    res.status(200).json({ status: "success", data: order });
  } catch (err) {
    throw new AppError(err.message || "Failed to update order status", 500);
  }
};
