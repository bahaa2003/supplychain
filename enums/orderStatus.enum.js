export const orderStatus = {
  CREATED: "Created", // موظف أنشأ الأوردر
  APPROVED: "Approved", // مدير وافق على الأوردر
  REJECTED: "Rejected", // مدير رفض الأوردر
  SUBMITTED: "Submitted", // تم إرسال الأوردر للمورد
  ACCEPTED: "Accepted", // المورد قبل الأوردر
  DECLINED: "Declined", // المورد رفض الأوردر
  PREPARING: "Preparing", // المورد يحضر الأوردر
  READY_TO_SHIP: "Ready_to_ship", // جاهز للشحن
  SHIPPED: "Shipped", // تم الشحن
  DELIVERED: "Delivered", // تم التسليم
  RECEIVED: "Received", // المستلم استلم الأوردر
  RETURNED: "Returned", // تم إرجاع كامل أو جزئي
  RETURN_PROCESSED: "Return_processed", // المورد عالج الإرجاع
  COMPLETED: "Completed", // العملية مكتملة
  CANCELLED: "Cancelled", // ملغي
  FAILED: "Failed", // فشل
};

export const orderStatusEnum = Object.values(orderStatus);

// Valid status transitions
export const VALID_ORDER_TRANSITIONS = {
  [orderStatus.CREATED]: [
    orderStatus.APPROVED,
    orderStatus.REJECTED,
    orderStatus.CANCELLED,
  ],
  [orderStatus.APPROVED]: [orderStatus.SUBMITTED, orderStatus.CANCELLED],
  [orderStatus.REJECTED]: [orderStatus.CREATED, orderStatus.CANCELLED], // إعادة تعديل
  [orderStatus.SUBMITTED]: [
    orderStatus.ACCEPTED,
    orderStatus.DECLINED,
    orderStatus.CANCELLED,
  ],
  [orderStatus.ACCEPTED]: [orderStatus.PREPARING, orderStatus.CANCELLED],
  [orderStatus.DECLINED]: [orderStatus.CANCELLED],
  [orderStatus.PREPARING]: [orderStatus.READY_TO_SHIP, orderStatus.CANCELLED],
  [orderStatus.READY_TO_SHIP]: [orderStatus.SHIPPED, orderStatus.CANCELLED],
  [orderStatus.SHIPPED]: [orderStatus.DELIVERED, orderStatus.FAILED],
  [orderStatus.DELIVERED]: [
    orderStatus.RECEIVED,
    orderStatus.RETURNED,
    orderStatus.FAILED,
  ],
  [orderStatus.RECEIVED]: [orderStatus.COMPLETED, orderStatus.RETURNED],
  [orderStatus.RETURNED]: [orderStatus.RETURN_PROCESSED],
  [orderStatus.RETURN_PROCESSED]: [orderStatus.COMPLETED],
  [orderStatus.COMPLETED]: [],
  [orderStatus.CANCELLED]: [],
  [orderStatus.FAILED]: [orderStatus.CANCELLED],
};

// Role permissions for status changes
export const ORDER_ROLE_PERMISSIONS = {
  buyer: {
    [orderStatus.CREATED]: [
      orderStatus.APPROVED,
      orderStatus.REJECTED,
      orderStatus.CANCELLED,
    ],
    [orderStatus.APPROVED]: [orderStatus.SUBMITTED, orderStatus.CANCELLED],
    [orderStatus.REJECTED]: [orderStatus.CREATED, orderStatus.CANCELLED],
    [orderStatus.DELIVERED]: [orderStatus.RECEIVED, orderStatus.RETURNED],
    [orderStatus.RECEIVED]: [orderStatus.COMPLETED, orderStatus.RETURNED],
  },
  supplier: {
    [orderStatus.SUBMITTED]: [orderStatus.ACCEPTED, orderStatus.DECLINED],
    [orderStatus.ACCEPTED]: [orderStatus.PREPARING, orderStatus.CANCELLED],
    [orderStatus.PREPARING]: [orderStatus.READY_TO_SHIP, orderStatus.CANCELLED],
    [orderStatus.READY_TO_SHIP]: [orderStatus.SHIPPED, orderStatus.CANCELLED],
    [orderStatus.SHIPPED]: [orderStatus.DELIVERED],
    [orderStatus.RETURNED]: [orderStatus.RETURN_PROCESSED],
  },
};

// Helper function to check if transition is valid
export const canTransitionTo = (
  currentStatus,
  newStatus,
  userRole,
  userCompany,
  order
) => {
  // Check if transition is valid
  if (!VALID_ORDER_TRANSITIONS[currentStatus]?.includes(newStatus)) {
    return false;
  }

  // Determine user's role in this order
  const isBuyer = userCompany.toString() === order.buyer.toString();
  const isSupplier = userCompany.toString() === order.supplier.toString();

  if (!isBuyer && !isSupplier) {
    return false;
  }

  const role = isBuyer ? "buyer" : "supplier";

  // Check role permissions
  return (
    ORDER_ROLE_PERMISSIONS[role]?.[currentStatus]?.includes(newStatus) || false
  );
};

// Inventory impact points
export const INVENTORY_IMPACT = {
  // عند قبول المورد للأوردر - حجز الكمية
  [orderStatus.ACCEPTED]: {
    supplier: { reserve: true },
  },
  // عند الشحن - خصم من المخزون
  [orderStatus.SHIPPED]: {
    supplier: { deduct: true, unreserve: true },
  },
  // عند الاستلام - إضافة للمخزون
  [orderStatus.RECEIVED]: {
    buyer: { add: true },
  },
  // عند الإرجاع - خصم من مخزون المشتري
  [orderStatus.RETURNED]: {
    buyer: { deduct: true },
  },
  // عند معالجة الإرجاع - إضافة لمخزون المورد
  [orderStatus.RETURN_PROCESSED]: {
    supplier: { add: true },
  },
  // عند الإلغاء - إلغاء الحجز
  [orderStatus.CANCELLED]: {
    supplier: { unreserve: true },
  },
};
