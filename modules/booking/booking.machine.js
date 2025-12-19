import { createMachine, assign } from 'xstate';

export const bookingMachine = createMachine(
  {
    id: 'booking',
    initial: 'pending',
    context: {
      bookingId: null,
      doctorId: null,
      dateTime: null,
      paymentMethod: null,
      error: null,
      attempts: 0,
    },
    states: {
      pending: {
        on: {
          CONFIRM: {
            target: 'confirming',
            cond: 'hasRequiredFields',
          },
          CANCEL: 'cancelled',
        },
      },
      confirming: {
        invoke: {
          src: 'confirmBooking',
          onDone: {
            target: 'confirmed',
            actions: assign({ bookingId: (_, event) => event.data.bookingId }),
          },
          onError: {
            target: 'pending',
            actions: assign({
              error: (_, event) => event.data.message,
              attempts: (ctx) => ctx.attempts + 1,
            }),
          },
        },
      },
      confirmed: {
        on: {
          RESCHEDULE: 'rescheduling',
          CANCEL: 'cancelled',
        },
      },
      rescheduling: {
        invoke: {
          src: 'rescheduleBooking',
          onDone: {
            target: 'confirmed',
            actions: assign({
              dateTime: (_, event) => event.data.dateTime,
            }),
          },
          onError: {
            target: 'confirmed',
            actions: assign({ error: (_, event) => event.data.message }),
          },
        },
      },
      cancelled: {
        type: 'final',
      },
    },
  },
  {
    guards: {
      hasRequiredFields: (ctx) =>
        ctx.doctorId && ctx.dateTime && ctx.paymentMethod,
    },
  }
);
