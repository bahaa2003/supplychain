import Order from "../../models/Order.js";

/**
 * Fetches orders for a company with flexible filtering and pagination.
 * @param {Object} params
 * @param {string} params.companyId - The company ID to fetch orders for (required for sent/received, optional for all).
 * @param {string} [params.direction] - 'sent' | 'received' | undefined
 * @param {string} [params.filterCompanyId] - Filter by a specific company (buyer or supplier)
 * @param {Date|string} [params.from] - Start date (createdAt >= from)
 * @param {Date|string} [params.to] - End date (createdAt <= to)
 * @param {number} [params.page=1] - Page number for pagination
 * @param {number} [params.limit=20] - Page size for pagination
 * @returns {Promise<{orders: Array, total: number, page: number, totalPages: number}>}
 */
export default async function getCompanyOrdersService({
  companyId,
  direction,
  filterCompanyId,
  from,
  to,
  page = 1,
  limit = 20,
}) {
  if (!companyId) throw new Error("Company ID is required");
  const query = {};

  // Direction filter
  if (direction === "sent") {
    query.buyer = companyId;
  } else if (direction === "received") {
    query.supplier = companyId;
  } else {
    query.$or = [{ buyer: companyId }, { supplier: companyId }];
  }

  // Filter by other company (counterparty)
  if (filterCompanyId) {
    query.$or = [
      { ...query, buyer: filterCompanyId },
      { ...query, supplier: filterCompanyId },
    ];
  }

  // Date range filter
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("buyer supplier items.product")
      .exec(),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
