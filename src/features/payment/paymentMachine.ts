import { setup, assign } from "xstate";

export interface Package {
  amount: number;
  price: string;
  label: string;
}

export const PACKAGES: Package[] = [
  { amount: 5, price: "Rp 3.000", label: "Starter" },
  { amount: 10, price: "Rp 5.000", label: "Popular" },
  { amount: 20, price: "Rp 10.000", label: "Pro" },
];

interface PaymentContext {
  selectedPkg: Package | null;
}

type PaymentEvent =
  | { type: "SELECT_PACKAGE"; pkg: Package }
  | { type: "CONTINUE" }
  | { type: "PAYMENT_SUCCESS" }
  | { type: "PAYMENT_FAILURE" }
  | { type: "RETRY" }
  | { type: "RESET" };

export const paymentMachine = setup({
  types: {
    context: {} as PaymentContext,
    events: {} as PaymentEvent,
  },
}).createMachine({
  id: "payment",
  initial: "selecting",
  context: {
    selectedPkg: null,
  },
  states: {
    selecting: {
      on: {
        SELECT_PACKAGE: {
          actions: assign({ selectedPkg: ({ event }) => event.pkg }),
        },
        CONTINUE: {
          target: "qris",
          guard: ({ context }) => !!context.selectedPkg,
        },
      },
    },
    qris: {
      on: {
        PAYMENT_SUCCESS: "success",
        PAYMENT_FAILURE: "failure",
      },
    },
    success: {
      on: {
        RESET: {
          target: "selecting",
          actions: assign({ selectedPkg: null }),
        },
      },
    },
    failure: {
      on: {
        RETRY: "qris",
        RESET: {
          target: "selecting",
          actions: assign({ selectedPkg: null }),
        },
      },
    },
  },
});
