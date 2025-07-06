export const planDetails = {
  Free: {
    price: 0,
    durationDays: 30,
    trial: true,
    limits: {
      maxProducts: 10,
      maxEmployees: 2,
      maxOrders: 5,
      storageLimitMB: 100,
    },
  },
  Basic: {
    price: 199,
    durationDays: 30,
    trial: false,
    limits: {
      maxProducts: 500,
      maxEmployees: 10,
      maxOrders: 200,
      storageLimitMB: 1024,
    },
  },
  Pro: {
    price: 499,
    durationDays: 30,
    trial: false,
    limits: {
      maxProducts: 5000,
      maxEmployees: 100,
      maxOrders: 5000,
      storageLimitMB: 5120,
    },
  },
  Enterprise: {
    price: 999,
    durationDays: 30,
    trial: false,
    limits: {
      maxProducts: 20000,
      maxEmployees: 500,
      maxOrders: 10000,
      storageLimitMB: 10240,
    },
  },
};
