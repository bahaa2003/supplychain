export const inventoryChangeType = Object.freeze({
  INCOMING: "Incoming", // استلام بضاعة
  OUTGOING: "Outgoing", // إرسال بضاعة
  RESERVED: "Reserved", // حجز كمية
  UNRESERVED: "Unreserved", // إلغاء حجز
  ADJUSTMENT: "Adjustment", // تعديل يدوي
  DAMAGED: "Damaged", // تلف
  EXPIRED: "Expired", // انتهاء صلاحية
  RETURNED: "Returned", // إرجاع
  TRANSFER: "Transfer", // نقل بين المواقع
});

export const inventoryChangeTypeEnum = Object.values(inventoryChangeType);
