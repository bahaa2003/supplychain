import Order from '../../models/Order.js';
import Invoice from '../../models/Invoice.js';
import { AppError } from '../../utils/AppError.js';
import { v4 as uuidv4 } from 'uuid';

export const generateInvoiceFromOrder = async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate('buyer supplier createdBy items.product')
    .exec();

  if (!order) return next(new AppError('Order not found', 404));

  if (order.invoice) {
    return next(new AppError('Invoice already exists for this order', 400));
  }

  const items = order.items.map((item) => {
    const taxRate = 14;
    const total = item.unitPrice * item.quantity;
    return {
      product: item.product._id,
      description: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate,
      total,
    };
  });

  const totalSales = items.reduce((sum, i) => sum + i.total, 0);
  const totalTax = items.reduce((sum, i) => sum + (i.total * i.taxRate) / 100, 0);
  const totalAmount = totalSales + totalTax;

  const invoice = await Invoice.create({
    invoiceNumber: `INV-${Date.now()}`,
    uuid: uuidv4(),
    issueDate: new Date(),
    issuer: order.supplier._id,
    receiver: order.buyer._id,
    items,
    totalSales,
    totalTax,
    totalAmount,
    status: 'accepted',
    createdBy: req.user._id,
    relatedOrder: order._id
  });

  order.invoice = invoice._id;
  await order.save();

  res.status(201).json({
    message: 'Invoice generated from order successfully',
    invoice
  });
};
