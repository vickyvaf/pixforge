import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useMachine } from "@xstate/react";
import {
  X,
  CreditCard,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "../../uikit/Button";
import { creditActor } from "../credits/creditMachine";
import { paymentMachine, PACKAGES } from "./paymentMachine";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [state, send] = useMachine(paymentMachine);
  const { selectedPkg } = state.context;

  // Effect to handle side-effect of successful payment
  // In a stricter XState model, parent would communicate with child, or we'd use an Output.
  // Here we just observe the state transition for simplicity in this refactor.
  useEffect(() => {
    if (state.matches("success") && selectedPkg) {
      // Avoid double credit addition if re-rendering, but XState usually handles this transition once.
      // Ideally, the machine would fire an output or we'd check previous state.
      // For this refactor, we rely on the button click "Verify Success" triggered transition.
      // Wait, this effect runs on *every* render where it matches success.
      // We should perform the credit add in the *event handler* or via a machine action.
      // Let's do it in `simulatePayment` for now to be safe, OR rely on a separate action.
      // Actually, let's keep it simple: The logic below in `simulatePayment` handles the dispatch.
    }
  }, [state.value]); // eslint-disable-line

  if (!isOpen) return null;

  const handleClose = () => {
    send({ type: "RESET" });
    onClose();
  };

  const handleContinue = () => {
    send({ type: "CONTINUE" });
  };

  const simulatePayment = (success: boolean) => {
    if (success && selectedPkg) {
      creditActor.send({ type: "ADD_CREDITS", amount: selectedPkg.amount });
      send({ type: "PAYMENT_SUCCESS" });
    } else {
      send({ type: "PAYMENT_FAILURE" });
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {state.matches("selecting") && (
              <>
                <Sparkles className="h-5 w-5 text-blue-600" /> Top Up Credits
              </>
            )}
            {state.matches("qris") && (
              <>
                <QrCode className="h-5 w-5 text-blue-600" /> Scan to Pay
              </>
            )}
            {state.matches("success") && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" /> Success
              </>
            )}
            {state.matches("failure") && (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" /> Failed
              </>
            )}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg min-w-0" // override padding/min-w if needed for icon buttons
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* STEP 1: SELECT PACKAGE */}
          {state.matches("selecting") && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Select a credit package to continue.
              </p>
              <div className="grid gap-3">
                {PACKAGES.map((pkg) => (
                  <Button
                    key={pkg.amount}
                    variant="secondary"
                    onClick={() => send({ type: "SELECT_PACKAGE", pkg })}
                    className={`w-full p-4 h-auto border rounded-xl transition-all group hover:bg-gray-50 flex items-center ${
                      selectedPkg?.amount === pkg.amount
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100 hover:bg-blue-50"
                        : "border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          selectedPkg?.amount === pkg.amount
                            ? "bg-blue-200"
                            : "bg-gray-100 group-hover:bg-blue-100"
                        }`}
                      >
                        <CreditCard
                          className={`h-5 w-5 ${
                            selectedPkg?.amount === pkg.amount
                              ? "text-blue-700"
                              : "text-gray-600 group-hover:text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-gray-900 truncate">
                            {pkg.amount} Credits
                          </p>
                          <span className="font-bold text-gray-900 whitespace-nowrap group-hover:text-blue-700 transition-colors">
                            {pkg.price}
                          </span>
                        </div>
                        <p className="text-xs text-left text-gray-500 font-medium">
                          {pkg.label}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleContinue}
                disabled={!selectedPkg}
                fullWidth
                className="mt-4 gap-2 rounded-xl"
              >
                Continue to Pay <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STEP 2: QRIS SCAN */}
          {state.matches("qris") && (
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PixForge-${selectedPkg?.amount}`}
                  alt="QRIS Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  QRIS payment
                </p>
                <p className="text-sm text-gray-500">
                  Amount: {selectedPkg?.price}
                </p>
              </div>

              <div className="flex gap-3 w-full bg-gray-50 p-4 rounded-lg">
                <Button
                  onClick={() => simulatePayment(true)}
                  variant="secondary"
                  className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 border-none"
                >
                  Verify Success
                </Button>
                <Button
                  onClick={() => simulatePayment(false)}
                  variant="secondary"
                  className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 border-none"
                >
                  Simulate Fail
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {state.matches("success") && (
            <div className="flex flex-col items-center justify-center space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Payment Successful!
                </h3>
                <p className="text-gray-600 mt-2">
                  You have received {selectedPkg?.amount} credits.
                </p>
              </div>
              <Button
                onClick={handleClose}
                fullWidth
                className="bg-gray-900 hover:bg-gray-800 rounded-xl"
              >
                Close
              </Button>
            </div>
          )}

          {/* STEP 4: FAILURE */}
          {state.matches("failure") && (
            <div className="flex flex-col items-center justify-center space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Payment Failed
                </h3>
                <p className="text-gray-600 mt-2">
                  Something went wrong. Please try again.
                </p>
              </div>
              <Button
                onClick={() => send({ type: "RETRY" })}
                fullWidth
                className="gap-2 rounded-xl"
              >
                <RotateCcw className="h-4 w-4" /> Try Again
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 text-xs text-center text-gray-400">
          Secure payment via Stripe (Mock)
        </div>
      </div>
    </div>,
    document.body
  );
};
