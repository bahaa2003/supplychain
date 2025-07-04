export const partnerConnectionStatus = {
  PENDING: "Pending",
  CANCELLED: "Cancelled",
  ACTIVE: "Active",
  REJECTED: "Rejected",
  INACTIVE: "Inactive",
  COMPLETED: "Completed",
  EXPIRED: "Expired",
  TERMINATED: "Terminated",
};

export const terminationTypeEnum = [
  partnerConnectionStatus.TERMINATED,
  partnerConnectionStatus.COMPLETED,
  partnerConnectionStatus.EXPIRED,
  partnerConnectionStatus.CANCELLED,
];

export const partnerConnectionStatusEnum = Object.values(
  partnerConnectionStatus
); // Valid status transitions
export const VALID_TRANSITIONS = {
  Pending: [
    partnerConnectionStatus.ACTIVE,
    partnerConnectionStatus.REJECTED,
    partnerConnectionStatus.CANCELLED,
  ],
  Active: [
    partnerConnectionStatus.INACTIVE,
    partnerConnectionStatus.COMPLETED,
    partnerConnectionStatus.TERMINATED,
    partnerConnectionStatus.EXPIRED,
  ],
  Inactive: [
    partnerConnectionStatus.ACTIVE,
    partnerConnectionStatus.TERMINATED,
    partnerConnectionStatus.EXPIRED,
  ],
  Rejected: [],
  Completed: [],
  Terminated: [],
  Expired: [],
  Cancelled: [],
};
// Role permissions
export const ROLE_PERMISSIONS = {
  requester: {
    Pending: [partnerConnectionStatus.CANCELLED],
    Active: [
      partnerConnectionStatus.INACTIVE,
      partnerConnectionStatus.COMPLETED,
      partnerConnectionStatus.TERMINATED,
    ],
    Inactive: [
      partnerConnectionStatus.ACTIVE,
      partnerConnectionStatus.TERMINATED,
    ],
  },
  recipient: {
    Pending: [partnerConnectionStatus.ACTIVE, partnerConnectionStatus.REJECTED],
    Active: [
      partnerConnectionStatus.INACTIVE,
      partnerConnectionStatus.COMPLETED,
      partnerConnectionStatus.TERMINATED,
      partnerConnectionStatus.EXPIRED,
    ],
    Inactive: [
      partnerConnectionStatus.ACTIVE,
      partnerConnectionStatus.TERMINATED,
    ],
  },
};
