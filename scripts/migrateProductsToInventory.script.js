import mongoose from "mongoose";
import Product from "../models/Product.schema.js";
import Inventory from "../models/Inventory.schema.js";
import dotenv from "dotenv";
dotenv.config();

async function migrateProductsToInventory() {
  try {
    console.log("starting migration...");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to database");

    const products = await Product.find({});
    console.log(`found ${products.length} products to migrate`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // processing each product
    for (const product of products) {
      try {
        // check if inventory record already exists for this product
        const existingInventory = await Inventory.findOne({
          product: product._id,
          company: product.company,
        });

        if (existingInventory) {
          console.log(
            `product ${product.productName} already exists in inventory, updating...`
          );

          // update existing inventory record
          existingInventory.productName = product.productName;
          existingInventory.sku = product.sku;
          existingInventory.unitPrice = product.unitPrice;
          existingInventory.unit = product.unit;
          existingInventory.category = product.category;
          existingInventory.isActive = product.isActive;

          await existingInventory.save();
          successCount++;
        } else {
          // create new inventory record
          const inventoryData = {
            product: product._id,
            company: product.company,
            productName: product.productName,
            sku: product.sku,
            unitPrice: product.unitPrice,
            unit: product.unit,
            category: product.category,
            isActive: product.isActive,
            onHand: 0,
            reserved: 0,
            minimumThreshold: 10,
          };

          await Inventory.create(inventoryData);
          successCount++;
          console.log(`product ${product.productName} migrated successfully`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          productId: product._id,
          productName: product.productName,
          error: error.message,
        });
        console.error(
          `error migrating product ${product.productName}:`,
          error.message
        );
      }
    }

    console.log("\nsummary of migration:");
    console.log(`success: ${successCount}`);
    console.log(`fail: ${errorCount}`);

    if (errors.length > 0) {
      console.log("\nerrors:");
      errors.forEach((err) => {
        console.log(`- ${err.productName}: ${err.error}`);
      });
    }

    // delete products collection if no errors
    if (errorCount === 0) {
      const confirmation = process.argv[2]; // يمكن تمرير --confirm كمعامل

      if (confirmation === "--confirm-delete") {
        await Product.collection.drop();
        console.log("\ndropped products collection successfully");
      } else {
        console.log("\ndid not drop products collection.");
      }
    } else {
      console.log("\ndid not drop products collection due to errors.");
    }
  } catch (error) {
    console.error("error during migration:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\ndatabase connection closed");
  }
}

migrateProductsToInventory();
