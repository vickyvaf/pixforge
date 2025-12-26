import { setup, assign, createActor } from "xstate";

interface CreditContext {
  credits: number;
}

type CreditEvent =
  | { type: "ADD_CREDITS"; amount: number }
  | { type: "USE_CREDIT" };

const INITIAL_CREDITS = 0;

const getStoredCredits = (): number => {
  const stored = localStorage.getItem("pixforge_credits");
  return stored ? parseInt(stored, 10) : INITIAL_CREDITS;
};

const persistCredits = (credits: number) => {
  localStorage.setItem("pixforge_credits", credits.toString());
};

export const creditMachine = setup({
  types: {
    context: {} as CreditContext,
    events: {} as CreditEvent,
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QGMBOkCWAXWA6AhslhgG5gDEAggCLUD6AwgEoCi1AkgCoDKA2gAwBdRKAAOAe1jYM4gHYiQAD0QA2ABy4AnPxUAmAKwAaEAE9Eu-gBYtOgwF87xtJhwEipCgFVuLRqw6cAsJIIBJSxHIKygiWusZmCGoAjLj6Do4gsuIQcArOENjwIWHSkSHRALQq8YhVDk7oBa6ExGQKJRHy5YhJ-Py4AMwA7L2aw0amiAPTg0n26UA */
  id: "credits",
  initial: "active",
  context: {
    credits: getStoredCredits(),
  },
  states: {
    active: {
      on: {
        ADD_CREDITS: {
          actions: [
            assign({
              credits: ({ context, event }) => context.credits + event.amount,
            }),
            ({ context, event }) =>
              persistCredits(context.credits + event.amount), // Persist immediately (simplification)
          ],
        },
        USE_CREDIT: {
          guard: ({ context }) => context.credits > 0,
          actions: [
            assign({ credits: ({ context }) => context.credits - 1 }),
            ({ context }) => persistCredits(context.credits - 1),
          ],
        },
      },
    },
  },
});

// Create and export a singleton actor instance
export const creditActor = createActor(creditMachine);
creditActor.start();
